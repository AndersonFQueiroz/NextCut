package com.nextcut.app;

import com.nextcut.controller.ApiResponse;
import com.nextcut.controller.ApiErrorResponse;
import com.nextcut.controller.AuthController;
import com.nextcut.controller.HealthController;
import com.nextcut.controller.QueueController;
import com.nextcut.dao.JdbcQueueEntryDao;
import com.nextcut.dao.JdbcAuthDao;
import com.nextcut.service.AuthService;
import com.nextcut.service.QueueService;
import com.nextcut.websocket.QueueWebSocket;
import io.javalin.Javalin;
import io.javalin.http.HttpResponseException;

/**
 * Fábrica responsável por instanciar e configurar o servidor Javalin.
 * Centraliza a Injeção de Dependências e configurações globais de roteamento e exceções.
 */
public final class AppFactory {
    private AppFactory() {
    }

    public static Javalin create() {
        // Uso de JdbcQueueEntryDao para persistência real (F2 Corretude)
        var queueEntryDao = new JdbcQueueEntryDao();
        var queueWebSocket = new QueueWebSocket();
        var queueService = new QueueService(queueEntryDao, queueWebSocket::broadcastSnapshot);
        var queueController = new QueueController(queueService);

        var authDao = new JdbcAuthDao();
        var authService = new AuthService(authDao);
        var authController = new AuthController(authService);

        return Javalin.create(config -> {
            config.startup.showJavalinBanner = false;
            config.routes.get("/", ctx -> ctx.json(ApiResponse.ok(new ApiInfo("NextCut API", "running"))));
            HealthController.register(config.routes);
            queueController.register(config.routes);
            authController.register(config.routes);
            queueWebSocket.register(config.routes, queueService);

            config.routes.exception(HttpResponseException.class, (e, ctx) -> {
                ctx.status(e.getStatus()).json(ApiErrorResponse.of(e.getMessage()));
            });
            config.routes.exception(Exception.class, (e, ctx) -> {
                ctx.status(500).json(ApiErrorResponse.of("Erro interno do servidor"));
            });
        });
    }

    private record ApiInfo(String name, String status) {
    }
}
