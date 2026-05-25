package com.nextcut.app;

import com.nextcut.controller.ApiResponse;
import com.nextcut.controller.ApiErrorResponse;
import com.nextcut.controller.AdminController;
import com.nextcut.controller.AuthController;
import com.nextcut.controller.HealthController;
import com.nextcut.controller.QueueController;
import com.nextcut.dao.JdbcQueueEntryDao;
import com.nextcut.dao.JdbcAuthDao;
import com.nextcut.service.AuthService;
import com.nextcut.service.OtpService;
import com.nextcut.service.QueueService;
import com.nextcut.websocket.QueueWebSocket;
import io.javalin.Javalin;
import io.javalin.http.HttpResponseException;
import io.javalin.json.JavalinJackson;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Fábrica responsável por instanciar e configurar o servidor Javalin.
 * Centraliza a Injeção de Dependências e configurações globais de roteamento e exceções.
 */
public final class AppFactory {
    private AppFactory() {
    }

    public static Javalin create() {
        var queueEntryDao = new JdbcQueueEntryDao();
        var authDao = new JdbcAuthDao();
        var queueWebSocket = new QueueWebSocket();
        var queueService = new QueueService(queueEntryDao, authDao, queueWebSocket::broadcastSnapshot);
        var otpService = new OtpService();
        var queueController = new QueueController(queueService, otpService);

        var authService = new AuthService(authDao);
        var authController = new AuthController(authService);
        var adminController = new AdminController(queueService, authDao);

        return Javalin.create(config -> {
            config.startup.showJavalinBanner = false;
            
            // Configura Jackson para suportar Java 8 Time API (Instant, LocalDate, etc)
            config.jsonMapper(new JavalinJackson(
                new ObjectMapper()
                    .registerModule(new JavaTimeModule())
                    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS),
                false
            ));

            // Habilita CORS para o frontend local (Vite/React) acessar a API
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> it.anyHost());
            });

            config.routes.get("/", ctx -> ctx.json(ApiResponse.ok(new ApiInfo("NextCut API", "running"))));
            HealthController.register(config.routes);
            queueController.register(config.routes);
            authController.register(config.routes);
            adminController.register(config.routes);
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
