package com.nextcut.websocket;

import com.nextcut.model.QueueSnapshot;
import com.nextcut.service.QueueService;
import io.javalin.config.RoutesConfig;
import io.javalin.websocket.WsContext;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class QueueWebSocket {
    private final Set<WsContext> clients = ConcurrentHashMap.newKeySet();

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

    public void broadcastSnapshot(QueueSnapshot snapshot) {
        clients.removeIf(ctx -> !ctx.session.isOpen());
        clients.forEach(ctx -> ctx.send(snapshot));
    }
}
