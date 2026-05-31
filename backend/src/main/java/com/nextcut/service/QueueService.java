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
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

public class QueueService {
    private final QueueEntryDao queueEntryDao;
    private final AuthDao authDao;
    private final Consumer<QueueSnapshot> queueNotifier;
    private final ArrayDeque<QueueEntry> queue = new ArrayDeque<>();
    private int nextTicketNumber = 1;
    private QueueEntry currentInService;

    private static final System.Logger LOGGER =
        System.getLogger(QueueService.class.getName());

    public QueueService(QueueEntryDao queueEntryDao, AuthDao authDao, Consumer<QueueSnapshot> queueNotifier) {
        this.queueEntryDao = queueEntryDao;
        this.authDao = authDao;
        this.queueNotifier = queueNotifier;
        restoreWaitingQueue();
    }

    public void assertShopIsOpen() {
        boolean isOpen = authDao.getBarberConfig().map(b -> b.isOpen()).orElse(true);
        if (!isOpen) {
            throw new io.javalin.http.ForbiddenResponse("A barbearia está fechada no momento.");
        }
    }

    public synchronized QueueEntry join(QueueJoinRequest request) {
        assertShopIsOpen();
        
        var clientName = validateName(request.clientName());
        var clientPhone = PhoneNormalizer.normalize(request.clientPhone());

        var existingEntry = queueEntryDao.findWaitingByPhone(clientPhone);
        if (existingEntry.isPresent()) {
            return existingEntry.get();
        }

        if (currentInService != null && currentInService.clientPhone().equals(clientPhone)) {
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
     * Calcula a estimativa de espera para um cliente com base na posição atual.
     *
     * @param posicao posição do cliente na fila (1 = próximo a ser atendido)
     * @param avgServiceMinutes tempo médio de atendimento em minutos
     * @return tempo estimado de espera em minutos, com 0 para o próximo cliente
     */
    public int calcularEstimativa(int posicao, int avgServiceMinutes) {
        // Garante que a posição usada no cálculo não seja menor que 1.
        int safePosition = Math.max(posicao, 1);
        // Calcula quantos clientes ainda irão ser atendidos antes.
        int waitingCustomers = Math.max(safePosition - 1, 0);
        // Retorna o total de minutos estimados de espera.
        return waitingCustomers * avgServiceMinutes;
    }

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

        if (currentInService != null && currentInService.ticketNumber() >= nextTicketNumber) {
            nextTicketNumber = currentInService.ticketNumber() + 1;
        }

        // LOG DE INICIALIZAÇÃO (#28)
        LOGGER.log(System.Logger.Level.INFO,
            "[NextCut] Fila restaurada: {0} cliente(s) em espera{1}",
            restored.size(),
            currentInService != null
                ? ", 1 em atendimento (senha #" + currentInService.ticketNumber() + ")"
                : ""
        );

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