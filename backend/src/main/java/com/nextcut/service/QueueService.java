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

    public synchronized QueueEntry join(QueueJoinRequest request) {
        var clientName = validateName(request.clientName());
        var clientPhone = PhoneNormalizer.normalize(request.clientPhone());

        queueEntryDao.findWaitingByPhone(clientPhone).ifPresent(entry -> {
            throw new ConflictResponse("Cliente já está na fila");
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
        return QueueSnapshot.from(new ArrayList<>(queue));
    }

    public synchronized QueueEntry statusByPhone(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        return queueEntryDao.findWaitingByPhone(normalizedPhone)
            .orElseThrow(() -> new NotFoundResponse("Cliente não encontrado na fila"));
    }

    public synchronized QueueEntry leave(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        var entry = queueEntryDao.findWaitingByPhone(normalizedPhone)
            .orElseThrow(() -> new NotFoundResponse("Cliente não encontrado na fila"));

        queue.removeIf(item -> item.clientPhone().equals(normalizedPhone));
        var updatedEntry = entry.withStatus(QueueStatus.LEFT, null);
        queueEntryDao.update(updatedEntry);
        refreshPositions();
        notifyQueueChanged();
        return updatedEntry;
    }

    public synchronized QueueEntry callNext() {
        var entry = queue.pollFirst();
        if (entry == null) {
            throw new NotFoundResponse("Fila vazia");
        }

        var updatedEntry = entry.withStatus(QueueStatus.DONE, Instant.now());
        queueEntryDao.update(updatedEntry);
        refreshPositions();
        notifyQueueChanged();
        return updatedEntry;
    }

    private void restoreWaitingQueue() {
        var restored = queueEntryDao.findWaitingEntries();
        restored.forEach(queue::addLast);
        nextTicketNumber = restored.stream()
            .mapToInt(QueueEntry::ticketNumber)
            .max()
            .orElse(0) + 1;
        refreshPositions();
    }

    private void refreshPositions() {
        var reorderedQueue = new ArrayDeque<QueueEntry>();
        var position = 1;

        for (QueueEntry entry : queue) {
            var updatedEntry = entry.withPosition(position++);
            reorderedQueue.addLast(updatedEntry);
            queueEntryDao.update(updatedEntry);
        }

        queue.clear();
        queue.addAll(reorderedQueue);
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
