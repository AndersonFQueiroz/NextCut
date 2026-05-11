package com.nextcut.app;

import com.nextcut.controller.HealthController;
import com.nextcut.controller.QueueController;
import com.nextcut.dao.InMemoryQueueEntryDao;
import com.nextcut.service.QueueService;
import com.nextcut.websocket.QueueWebSocket;
import io.javalin.Javalin;

public final class AppFactory {
    private AppFactory() {
    }

    public static Javalin create() {
        var queueEntryDao = new InMemoryQueueEntryDao();
        var queueWebSocket = new QueueWebSocket();
        var queueService = new QueueService(queueEntryDao, queueWebSocket::broadcastSnapshot);
        var queueController = new QueueController(queueService);

        return Javalin.create(config -> {
            config.startup.showJavalinBanner = false;
            config.routes.get("/", ctx -> ctx.json(new ApiInfo("NextCut API", "running")));
            HealthController.register(config.routes);
            queueController.register(config.routes);
            queueWebSocket.register(config.routes, queueService);
        });
    }

    private record ApiInfo(String name, String status) {
    }
}
