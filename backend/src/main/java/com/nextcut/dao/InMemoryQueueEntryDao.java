package com.nextcut.dao;

import com.nextcut.model.QueueEntry;
import com.nextcut.model.QueueStatus;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

public class InMemoryQueueEntryDao implements QueueEntryDao {
    private final LinkedHashMap<String, QueueEntry> entriesByPhone = new LinkedHashMap<>();

    @Override
    public synchronized QueueEntry save(QueueEntry entry) {
        entriesByPhone.put(entry.clientPhone(), entry);
        return entry;
    }

    @Override
    public synchronized Optional<QueueEntry> findWaitingByPhone(String phone) {
        return Optional.ofNullable(entriesByPhone.get(phone))
            .filter(entry -> entry.status() == QueueStatus.WAITING);
    }

    @Override
    public synchronized List<QueueEntry> findWaitingEntries() {
        return entriesByPhone.values().stream()
            .filter(entry -> entry.status() == QueueStatus.WAITING)
            .toList();
    }

    @Override
    public synchronized void update(QueueEntry entry) {
        entriesByPhone.put(entry.clientPhone(), entry);
    }
}
