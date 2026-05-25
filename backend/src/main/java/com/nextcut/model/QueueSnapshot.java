package com.nextcut.model;

import java.util.List;

/**
 * Snapshot completo do estado atual da fila, usado para broadcasts via WebSocket.
 * Inclui a lista de clientes, status de funcionamento e tempo médio de serviço.
 */
public record QueueSnapshot(
    List<QueueEntry> queue,
    QueueEntry inServiceEntry,
    int size,
    boolean isOpen,
    int avgServiceMinutes
) {
    /**
     * Cria um snapshot com valores padrão de operação (aberto, 15 min).
     * Usado quando as informações do barbeiro não estão disponíveis.
     */
    public static QueueSnapshot from(List<QueueEntry> entries, QueueEntry inService) {
        return new QueueSnapshot(entries, inService, entries.size(), true, 15);
    }

    /**
     * Cria um snapshot completo com dados do barbeiro.
     */
    public static QueueSnapshot from(List<QueueEntry> entries, QueueEntry inService, boolean isOpen, int avgServiceMinutes) {
        return new QueueSnapshot(entries, inService, entries.size(), isOpen, avgServiceMinutes);
    }
}
