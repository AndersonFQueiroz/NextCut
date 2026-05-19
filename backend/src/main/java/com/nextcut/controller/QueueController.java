package com.nextcut.controller;

import com.nextcut.model.QueueJoinRequest;
import com.nextcut.service.QueueService;
import io.javalin.config.RoutesConfig;

public class QueueController {
    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    public void register(RoutesConfig routes) {
        routes.post("/queue/join", ctx -> {
            var request = ctx.bodyAsClass(QueueJoinRequest.class);
            ctx.status(201).json(ApiResponse.ok(queueService.join(request)));
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
