package com.nextcut.model;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO para resposta detalhada do status de um cliente na fila.
 * Inclui o cálculo de estimativa de espera.
 */
public record QueueStatusResponse(
    UUID id,
    int ticketNumber,
    String clientName,
    String clientPhone,
    QueueStatus status,
    int position,
    Instant enteredAt,
    int waitEstimateMinutes
) {
    public static QueueStatusResponse from(QueueEntry entry, int avgServiceMinutes) {
        int estimate = Math.max(0, (entry.position() - 1) * avgServiceMinutes);
        return new QueueStatusResponse(
            entry.id(),
            entry.ticketNumber(),
            entry.clientName(),
            entry.clientPhone(),
            entry.status(),
            entry.position(),
            entry.enteredAt(),
            estimate
        );
    }
}
