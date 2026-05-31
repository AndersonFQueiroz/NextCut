package com.nextcut.controller;

import com.nextcut.dao.AuthDao;
import com.nextcut.service.QueueService;
import com.nextcut.util.PixGenerator;
import io.javalin.config.RoutesConfig;

import java.util.Map;
import java.util.UUID;

/**
 * Controller responsável pelos endpoints administrativos do barbeiro.
 * Gerencia chamadas de clientes, remoções, controle de abertura/fechamento e pagamento Pix.
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
            var body = ctx.bodyAsClass(FinishRequest.class);
            var entry = queueService.finishCurrent(body.amount(), body.tip());
            ctx.json(ApiResponse.ok(entry));
        });

        routes.post("/admin/toggle", ctx -> {
            var newStatus = authDao.toggleShopStatus();
            queueService.triggerBroadcast();
            ctx.json(ApiResponse.ok(new ShopStatusResponse(newStatus)));
        });

        // Solicita a cobrança para o cliente em atendimento (aparece na tela dele em tempo real)
        routes.post("/admin/payment/request", ctx -> {
            var body = ctx.bodyAsClass(PaymentRequestBody.class);
            queueService.requestPayment(body.amount());
            ctx.json(ApiResponse.ok(Map.of("message", "Cobrança enviada ao cliente.")));
        });

        // Gera payload Pix BR Code (público, pode ser chamado pelo frontend do admin ou cliente)
        routes.post("/pix/gerar", ctx -> {
            var body = ctx.bodyAsClass(PixGenerateRequest.class);

            String pixKey = resolveEnv("PIX_KEY", "SUA_CHAVE_PIX");
            String pixName = resolveEnv("PIX_NAME", "NEXTCUT BARBEARIA");
            String pixCity = resolveEnv("PIX_CITY", "SAO PAULO");

            String payload = PixGenerator.generatePayload(
                pixKey, body.amount(), pixName, pixCity, "NEXTCUT" + System.currentTimeMillis() % 100000
            );

            ctx.json(ApiResponse.ok(Map.of("payload", payload)));
        });

        // Cliente informa a gorjeta que adicionou (reflete na tela do admin)
        routes.post("/queue/payment/tip", ctx -> {
            var body = ctx.bodyAsClass(TipRequest.class);
            queueService.setTip(body.tipAmount());
            ctx.json(ApiResponse.ok(Map.of("message", "Gorjeta registrada.")));
        });
    }

    private String resolveEnv(String key, String fallback) {
        var value = System.getenv(key);
        if (value == null || value.isBlank()) {
            value = System.getProperty(key);
        }
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    private record ShopStatusResponse(boolean isOpen) {}
    private record FinishRequest(Double amount, Double tip) {}
    private record PaymentRequestBody(double amount) {}
    private record PixGenerateRequest(double amount) {}
    private record TipRequest(double tipAmount) {}
}
