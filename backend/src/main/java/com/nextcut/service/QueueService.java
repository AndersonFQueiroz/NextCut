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

    public QueueService(QueueEntryDao queueEntryDao, AuthDao authDao, Consumer<QueueSnapshot> queueNotifier) {
        this.queueEntryDao = queueEntryDao;
        this.authDao = authDao;
        this.queueNotifier = queueNotifier;
        restoreWaitingQueue();
    }

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

    public synchronized QueueSnapshot snapshot() {
        return authDao.getBarberConfig()
            .map(b -> QueueSnapshot.from(new ArrayList<>(queue), b.isOpen(), b.avgServiceMinutes()))
            .orElseGet(() -> QueueSnapshot.from(new ArrayList<>(queue)));
    }

    public synchronized QueueStatusResponse statusByPhone(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        var entry = queueEntryDao.findWaitingByPhone(normalizedPhone)
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

    public void triggerBroadcast() {
        notifyQueueChanged();
    }

    private void restoreWaitingQueue() {
        var restored = queueEntryDao.findWaitingEntries();
        queue.clear();
        restored.forEach(queue::addLast);
        
        nextTicketNumber = restored.stream()
            .mapToInt(QueueEntry::ticketNumber)
            .max()
            .orElse(0) + 1;
        
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
