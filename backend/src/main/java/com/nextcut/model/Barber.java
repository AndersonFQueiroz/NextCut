package com.nextcut.model;

import java.time.Instant;
import java.util.UUID;

public record Barber(
    UUID id,
    String username,
    String passwordHash,
    int avgServiceMinutes,
    boolean isOpen,
    Instant createdAt
) {
}
