package com.nextcut.model;

import java.util.List;

public record QueueSnapshot(List<QueueEntry> entries, int size) {
    public static QueueSnapshot from(List<QueueEntry> entries) {
        return new QueueSnapshot(entries, entries.size());
    }
}
