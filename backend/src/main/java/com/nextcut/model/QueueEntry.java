package com.nextcut.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Representa uma entrada individual na fila de espera da barbearia.
 * Este registro (record) é imutável e reflete o estado de um cliente no sistema.
 * 
 * @param id Identificador único universal da entrada.
 * @param ticketNumber Número da senha sequencial gerada para o cliente no dia.
 * @param clientName Nome fornecido pelo cliente ao entrar na fila.
 * @param clientPhone Telefone de contato (normalizado) para acompanhamento.
 * @param status Estado atual do cliente (WAITING, IN_SERVICE, DONE, LEFT).
 * @param position Posição numérica atual na fila (1 = próximo a ser chamado).
 * @param enteredAt Instante exato em que o cliente entrou na fila.
 * @param calledAt Instante em que o barbeiro chamou o cliente (null se ainda estiver esperando).
 */
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
