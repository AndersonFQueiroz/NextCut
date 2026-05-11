package com.nextcut.model;

import java.time.Instant;
import java.util.UUID;

public record QueueEntry(
    UUID id,
    int ticketNumber,
    String clientName,
    String clientPhone,
    QueueStatus status,
    int position,
    Instant enteredAt,
    Instant calledAt
) {
    public QueueEntry withPosition(int newPosition) {
        return new QueueEntry(id, ticketNumber, clientName, clientPhone, status, newPosition, enteredAt, calledAt);
    }

    public QueueEntry withStatus(QueueStatus newStatus, Instant newCalledAt) {
        return new QueueEntry(id, ticketNumber, clientName, clientPhone, newStatus, position, enteredAt, newCalledAt);
    }
}
