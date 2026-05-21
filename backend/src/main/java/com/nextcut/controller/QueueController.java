package com.nextcut.controller;

import com.nextcut.model.QueueJoinRequest;
import com.nextcut.service.QueueService;
import io.javalin.config.RoutesConfig;

/**
 * Controlador responsável por expor os endpoints REST da fila de atendimento.
 * Gerencia as operações de entrada, saída e consulta de status para clientes e barbeiros.
 */
public class QueueController {
    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    /**
     * Registra as rotas da fila na configuração do Javalin.
     * @param routes Objeto de configuração de rotas.
     */
    public void register(RoutesConfig routes) {
        routes.post("/queue/join", ctx -> {
            var request = ctx.bodyAsClass(QueueJoinRequest.class);
            ctx.status(200).json(ApiResponse.ok(queueService.join(request)));
        });

        routes.get("/queue", ctx -> ctx.json(ApiResponse.ok(queueService.snapshot())));

        routes.get("/queue/status/{phone}", ctx -> {
            var phone = ctx.pathParam("phone");
            ctx.json(ApiResponse.ok(queueService.statusByPhone(phone)));
        });

        routes.post("/queue/leave/{phone}", ctx -> {
            var phone = ctx.pathParam("phone");
            ctx.json(ApiResponse.ok(queueService.leave(phone)));
        });

        routes.post("/admin/next", ctx -> ctx.json(ApiResponse.ok(queueService.callNext())));
    }
}
