package com.nextcut.service;

import com.nextcut.dao.AuthDao;
import com.nextcut.dao.QueueEntryDao;
import com.nextcut.model.QueueEntry;
import com.nextcut.model.QueueJoinRequest;
import com.nextcut.model.QueueSnapshot;
import com.nextcut.model.QueueStatus;
import com.nextcut.model.QueueStatusResponse;
import com.nextcut.util.PhoneNormalizer;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.ConflictResponse;
import io.javalin.http.NotFoundResponse;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

/**
 * Serviço que gerencia a lógica de negócio da fila de atendimento.
 * Mantém uma cópia em memória para acesso rápido e sincroniza com o banco de dados.
 */
public class QueueService {
    private final QueueEntryDao queueEntryDao;
    private final AuthDao authDao;
    private final Consumer<QueueSnapshot> queueNotifier;
    private final ArrayDeque<QueueEntry> queue = new ArrayDeque<>();
    private int nextTicketNumber = 1;
    private QueueEntry currentInService;

    public QueueService(QueueEntryDao queueEntryDao, AuthDao authDao, Consumer<QueueSnapshot> queueNotifier) {
        this.queueEntryDao = queueEntryDao;
        this.authDao = authDao;
        this.queueNotifier = queueNotifier;
        restoreWaitingQueue();
    }

    /**
     * Adiciona um novo cliente na fila de espera.
     * <p><strong>Lógica de negócio:</strong></p>
     * Se o cliente já estiver na fila (WAITING) ou já em atendimento (IN_SERVICE),
     * a inserção falha silenciosamente (idempotência) e o sistema devolve a posição
     * ou estado atual do cliente, evitando duplicidade e melhorando a UX no frontend.
     * 
     * @param request Objeto contendo nome e telefone do cliente.
     * @return QueueEntry contendo os dados do cliente atualizados.
     */
    public synchronized QueueEntry join(QueueJoinRequest request) {
        var clientName = validateName(request.clientName());
        var clientPhone = PhoneNormalizer.normalize(request.clientPhone());

        var existingEntry = queueEntryDao.findWaitingByPhone(clientPhone);
        if (existingEntry.isPresent()) {
            // Se o cliente já está na fila, apenas devolvemos a posição atual dele
            // em vez de dar erro. Isso permite que ele recupere o acompanhamento!
            return existingEntry.get();
        }

        if (currentInService != null && currentInService.clientPhone().equals(clientPhone)) {
            // Se o cliente já está em atendimento, também devolvemos a posição dele!
            return currentInService;
        }

        var entry = new QueueEntry(
            UUID.randomUUID(),
            nextTicketNumber++,
            clientName,
            clientPhone,
            QueueStatus.WAITING,
            queue.size() + 1,
            Instant.now(),
            null
        );

        queue.addLast(entry);
        queueEntryDao.save(entry);
        notifyQueueChanged();
        return entry;
    }

    public synchronized QueueSnapshot snapshot() {
        return authDao.getBarberConfig()
            .map(b -> QueueSnapshot.from(new ArrayList<>(queue), currentInService, b.isOpen(), b.avgServiceMinutes()))
            .orElseGet(() -> QueueSnapshot.from(new ArrayList<>(queue), currentInService));
    }

    /**
     * Recupera o status de um cliente baseado no seu número de telefone.
     * Verifica tanto a lista de espera no banco (WAITING) quanto a variável
     * em memória (IN_SERVICE) para garantir consistência em tempo real.
     * 
     * @param phone Telefone do cliente.
     * @return Objeto Response contendo o status, posição e tempo de espera estimado.
     * @throws NotFoundResponse caso o telefone não seja encontrado.
     */
    public synchronized QueueStatusResponse statusByPhone(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        var entry = queueEntryDao.findWaitingByPhone(normalizedPhone)
            .or(() -> {
                if (currentInService != null && currentInService.clientPhone().equals(normalizedPhone)) {
                    return Optional.of(currentInService);
                }
                return Optional.empty();
            })
            .orElseThrow(() -> new NotFoundResponse("Nenhum atendimento ativo encontrado para este número."));
        
        int avgWait = authDao.getBarberConfig().map(b -> b.avgServiceMinutes()).orElse(15);
        return QueueStatusResponse.from(entry, avgWait);
    }

    public synchronized QueueEntry leave(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        var entry = queueEntryDao.findWaitingByPhone(normalizedPhone)
            .orElseThrow(() -> new NotFoundResponse("Cliente não encontrado na fila ativa."));

        queue.removeIf(item -> item.clientPhone().equals(normalizedPhone));
        var updatedEntry = entry.withStatus(QueueStatus.LEFT, null);
        queueEntryDao.update(updatedEntry);
        
        refreshPositions();
        notifyQueueChanged();
        return updatedEntry;
    }

    public synchronized QueueEntry removeById(UUID id) {
        var entry = queueEntryDao.findById(id)
            .filter(e -> e.status() == QueueStatus.WAITING)
            .orElseThrow(() -> new NotFoundResponse("Cliente não encontrado na fila ativa."));

        queue.removeIf(item -> item.id().equals(id));
        var updatedEntry = entry.withStatus(QueueStatus.LEFT, null);
        queueEntryDao.update(updatedEntry);

        refreshPositions();
        notifyQueueChanged();
        return updatedEntry;
    }

    /**
     * Remove o primeiro cliente da fila (ArrayDeque) e o coloca em atendimento.
     * <p>Proteção:</p> Garante que o barbeiro conclua o atendimento anterior antes 
     * de chamar a próxima senha, prevenindo inconsistências.
     */
    public synchronized QueueEntry callNext() {
        if (currentInService != null) {
            throw new ConflictResponse("Finalize o atendimento atual antes de chamar o próximo.");
        }

        var entry = queue.pollFirst();
        if (entry == null) {
            throw new NotFoundResponse("Não há clientes aguardando na fila.");
        }

        var updatedEntry = entry.withStatus(QueueStatus.IN_SERVICE, Instant.now());
        queueEntryDao.update(updatedEntry);
        
        currentInService = updatedEntry;

        refreshPositions();
        notifyQueueChanged();
        return updatedEntry;
    }

    public synchronized QueueEntry finishCurrent() {
        if (currentInService == null) {
            throw new NotFoundResponse("Não há cliente em atendimento no momento.");
        }

        var updatedEntry = currentInService.withStatus(QueueStatus.DONE, currentInService.calledAt());
        queueEntryDao.update(updatedEntry);
        
        currentInService = null;
        
        notifyQueueChanged();
        return updatedEntry;
    }

    public void triggerBroadcast() {
        notifyQueueChanged();
    }

    /**
     * Função crucial executada ao iniciar o servidor (no construtor).
     * Recupera o estado (WAITING e IN_SERVICE) salvo no banco de dados e
     * remonta a fila em memória (ArrayDeque) para garantir que nenhuma informação
     * seja perdida em caso de reinício ou crash do servidor.
     */
    private void restoreWaitingQueue() {
        var restored = queueEntryDao.findWaitingEntries();
        queue.clear();
        restored.forEach(queue::addLast);
        
        var inService = queueEntryDao.findInServiceEntry();
        currentInService = inService.orElse(null);
        
        nextTicketNumber = restored.stream()
            .mapToInt(QueueEntry::ticketNumber)
            .max()
            .orElse(0) + 1;
            
        // Se houver alguém em atendimento que tenha uma senha maior, ajustamos.
        if (currentInService != null && currentInService.ticketNumber() >= nextTicketNumber) {
            nextTicketNumber = currentInService.ticketNumber() + 1;
        }
        
        refreshPositions();
    }

    private void refreshPositions() {
        queueEntryDao.updatePositions();
        
        var updatedList = queueEntryDao.findWaitingEntries();
        queue.clear();
        queue.addAll(updatedList);
    }

    private String validateName(String clientName) {
        if (clientName == null || clientName.isBlank()) {
            throw new BadRequestResponse("Nome do cliente é obrigatório");
        }

        return clientName.trim();
    }

    private void notifyQueueChanged() {
        queueNotifier.accept(snapshot());
    }
}
