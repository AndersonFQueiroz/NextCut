package com.nextcut.service;

import com.nextcut.dao.QueueEntryDao;
import com.nextcut.model.QueueEntry;
import com.nextcut.model.QueueJoinRequest;
import com.nextcut.model.QueueSnapshot;
import com.nextcut.model.QueueStatus;
import com.nextcut.util.PhoneNormalizer;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.ConflictResponse;
import io.javalin.http.NotFoundResponse;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

/**
 * Serviço que gerencia a lógica de negócio da fila de atendimento.
 * Mantém uma cópia em memória para acesso rápido e sincroniza com o banco de dados.
 */
public class QueueService {
    private final QueueEntryDao queueEntryDao;
    private final Consumer<QueueSnapshot> queueNotifier;
    private final ArrayDeque<QueueEntry> queue = new ArrayDeque<>();
    private int nextTicketNumber = 1;

    public QueueService(QueueEntryDao queueEntryDao, Consumer<QueueSnapshot> queueNotifier) {
        this.queueEntryDao = queueEntryDao;
        this.queueNotifier = queueNotifier;
        restoreWaitingQueue();
    }

    /**
     * Adiciona um novo cliente à fila (FIFO).
     * @param request Dados do cliente (nome e telefone).
     * @return A entrada criada.
     */
    public synchronized QueueEntry join(QueueJoinRequest request) {
        var clientName = validateName(request.clientName());
        var clientPhone = PhoneNormalizer.normalize(request.clientPhone());

        queueEntryDao.findWaitingByPhone(clientPhone).ifPresent(entry -> {
            throw new ConflictResponse("Você já está na fila de espera.");
        });

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

    /**
     * Retorna o estado atual da fila.
     */
    public synchronized QueueSnapshot snapshot() {
        return QueueSnapshot.from(new ArrayList<>(queue));
    }

    /**
     * Busca o status de um cliente específico pelo telefone.
     */
    public synchronized QueueEntry statusByPhone(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        return queueEntryDao.findWaitingByPhone(normalizedPhone)
            .orElseThrow(() -> new NotFoundResponse("Nenhum atendimento ativo encontrado para este número."));
    }

    /**
     * Remove um cliente da fila (desistência).
     * @param phone Telefone do cliente.
     * @return A entrada atualizada com status LEFT.
     */
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

    /**
     * Chama o próximo cliente da fila para atendimento.
     * @return A entrada atualizada com status DONE.
     */
    public synchronized QueueEntry callNext() {
        var entry = queue.pollFirst();
        if (entry == null) {
            throw new NotFoundResponse("Não há clientes aguardando na fila.");
        }

        var updatedEntry = entry.withStatus(QueueStatus.DONE, Instant.now());
        queueEntryDao.update(updatedEntry);
        
        refreshPositions();
        notifyQueueChanged();
        return updatedEntry;
    }

    /**
     * Restaura a fila em memória a partir dos dados persistidos no banco.
     */
    private void restoreWaitingQueue() {
        var restored = queueEntryDao.findWaitingEntries();
        queue.clear();
        restored.forEach(queue::addLast);
        
        // Garante que o ticket number continue de onde parou no dia, 
        // mesmo que clientes tenham saído ou sido atendidos.
        nextTicketNumber = restored.stream()
            .mapToInt(QueueEntry::ticketNumber)
            .max()
            .orElse(0) + 1;
        
        refreshPositions();
    }

    /**
     * Recalcula as posições dos clientes na fila.
     * Utiliza otimização em lote no banco de dados via DAO.
     */
    private void refreshPositions() {
        // Atualização em lote no banco de dados para melhor performance (E2)
        queueEntryDao.updatePositions();
        
        // Sincroniza a memória com o estado atual do banco
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
