package com.nextcut.websocket;

import com.nextcut.model.QueueSnapshot;
import com.nextcut.service.QueueService;
import io.javalin.config.RoutesConfig;
import io.javalin.websocket.WsContext;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gerenciador de conexões WebSocket para atualizações em tempo real.
 * Mantém uma lista de sessões ativas (clientes conectados) e envia notificações 
 * automáticas (broadcast) sempre que o estado da fila é alterado.
 */
public class QueueWebSocket {
    private final Set<WsContext> clients = ConcurrentHashMap.newKeySet();

    /**
     * Registra o endpoint do WebSocket e gerencia o ciclo de vida das conexões.
     */
    public void register(RoutesConfig routes, QueueService queueService) {
        routes.ws("/ws/queue", ws -> {
            ws.onConnect(ctx -> {
                clients.add(ctx);
                ctx.send(queueService.snapshot());
            });
            ws.onClose(ctx -> clients.remove(ctx));
            ws.onError(ctx -> clients.remove(ctx));
        });
    }

    /**
     * Envia o estado atual da fila (snapshot) para todos os clientes conectados.
     * Realiza uma limpeza automática de sessões inativas antes do envio.
     * 
     * @param snapshot Objeto contendo a lista atualizada de clientes em espera.
     */
    public void broadcastSnapshot(QueueSnapshot snapshot) {
        clients.removeIf(ctx -> !ctx.session.isOpen());
        clients.forEach(ctx -> ctx.send(snapshot));
    }
}
