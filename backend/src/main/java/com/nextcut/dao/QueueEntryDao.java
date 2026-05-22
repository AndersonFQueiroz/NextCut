package com.nextcut.dao;

import com.nextcut.model.QueueEntry;

import java.util.List;
import java.util.Optional;

public interface QueueEntryDao {
    QueueEntry save(QueueEntry entry);

    Optional<QueueEntry> findWaitingByPhone(String phone);

    List<QueueEntry> findWaitingEntries();

    void update(QueueEntry entry);

    void updateStatus(java.util.UUID id, com.nextcut.model.QueueStatus status);

    void updatePositions();
}
