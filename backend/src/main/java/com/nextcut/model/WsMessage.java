package com.nextcut.model;

/**
 * Estrutura padronizada para mensagens enviadas via WebSocket.
 * Segue o contrato definido no agents.md: { "event": "...", "payload": {...} }
 */
public record WsMessage(String event, Object payload) {
    public static WsMessage queueUpdated(Object payload) {
        return new WsMessage("QUEUE_UPDATED", payload);
    }

    public static WsMessage shopStatus(Object payload) {
        return new WsMessage("SHOP_STATUS", payload);
    }
}
