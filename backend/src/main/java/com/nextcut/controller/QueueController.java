package com.nextcut.controller;

import com.nextcut.model.QueueJoinRequest;
import com.nextcut.model.OtpRequest;
import com.nextcut.model.OtpVerifyRequest;
import com.nextcut.service.QueueService;
import com.nextcut.service.OtpService;
import io.javalin.config.RoutesConfig;

import java.util.Map;

/**
 * Controlador responsável por expor os endpoints REST da fila de atendimento.
 * Gerencia as operações de entrada, saída e consulta de status para clientes e barbeiros.
 */
public class QueueController {
    private final QueueService queueService;
    private final OtpService otpService;

    public QueueController(QueueService queueService, OtpService otpService) {
        this.queueService = queueService;
        this.otpService = otpService;
    }

    /**
     * Registra as rotas da fila na configuração do Javalin.
     * <p><strong>Segurança:</strong> Rotas de requisição e verificação de OTP são
     * abertas ao público. Nenhuma rota administrativa que exige autenticação
     * (como avançar a fila) deve ser registrada aqui (elas pertencem ao AdminController).</p>
     * 
     * @param routes Objeto de configuração de rotas.
     */
    public void register(RoutesConfig routes) {
        // Nova rota para solicitar o envio do código OTP
        routes.post("/queue/request-otp", ctx -> {
            queueService.assertShopIsOpen();
            var request = ctx.bodyAsClass(OtpRequest.class);
            otpService.generateAndSend(request.clientPhone());
            ctx.status(200).json(ApiResponse.ok(Map.of("message", "Código enviado com sucesso.")));
        });

        // Nova rota para verificar o código OTP e só então entrar na fila
        routes.post("/queue/verify-otp", ctx -> {
            queueService.assertShopIsOpen();
            var request = ctx.bodyAsClass(OtpVerifyRequest.class);
            otpService.verify(request.clientPhone(), request.otpCode());
            
            // Se chegou aqui, o código estava correto! Entra na fila:
            var joinRequest = new QueueJoinRequest(request.clientName(), request.clientPhone());
            ctx.status(201).json(ApiResponse.ok(queueService.join(joinRequest)));
        });

        routes.post("/queue/join", ctx -> {
            queueService.assertShopIsOpen();
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

    }
}
