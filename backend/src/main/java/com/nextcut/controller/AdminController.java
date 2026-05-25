package com.nextcut.controller;

import com.nextcut.dao.AuthDao;
import com.nextcut.service.QueueService;
import io.javalin.config.RoutesConfig;

import java.util.UUID;

/**
 * Controller responsável pelos endpoints administrativos do barbeiro.
 * Gerencia chamadas de clientes, remoções e controle de abertura/fechamento.
 */
public class AdminController {
    private final QueueService queueService;
    private final AuthDao authDao;

    public AdminController(QueueService queueService, AuthDao authDao) {
        this.queueService = queueService;
        this.authDao = authDao;
    }

    public void register(RoutesConfig routes) {
        routes.post("/admin/next", ctx -> {
            var entry = queueService.callNext();
            ctx.json(ApiResponse.ok(entry));
        });

        routes.post("/admin/remove/{id}", ctx -> {
            var id = UUID.fromString(ctx.pathParam("id"));
            var entry = queueService.removeById(id);
            ctx.json(ApiResponse.ok(entry));
        });

        routes.post("/admin/finish", ctx -> {
            var entry = queueService.finishCurrent();
            ctx.json(ApiResponse.ok(entry));
        });

        routes.post("/admin/toggle", ctx -> {
            var newStatus = authDao.toggleShopStatus();
            queueService.triggerBroadcast();
            ctx.json(ApiResponse.ok(new ShopStatusResponse(newStatus)));
        });
    }

    private record ShopStatusResponse(boolean isOpen) {
    }
}
