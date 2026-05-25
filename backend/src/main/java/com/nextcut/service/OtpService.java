package com.nextcut.service;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.TooManyRequestsResponse;
import com.nextcut.util.PhoneNormalizer;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço responsável por gerar e validar códigos OTP (One-Time Password)
 * para a entrada segura na fila via simulação de WhatsApp/SMS.
 * 
 * <p><strong>Por que este serviço existe?</strong></p>
 * O sistema exige que apenas clientes reais (com números autênticos) entrem na fila,
 * prevenindo spam ou reservas indevidas feitas por terceiros mal intencionados.
 * Como não queremos que o cliente crie uma conta complexa com senha, o modelo
 * OTP (como WhatsApp ou Uber usam) é a solução ideal.
 * 
 * <p>Mantém os códigos em memória usando um {@code ConcurrentHashMap} para 
 * alta performance e segurança contra condições de corrida (thread-safety).</p>
 */
public class OtpService {
    // Validade do código (ex: 3 minutos)
    private static final int OTP_VALIDITY_MINUTES = 3;
    // Máximo de tentativas erradas permitidas antes de bloquear o código
    private static final int MAX_ATTEMPTS = 3;
    // Tempo mínimo entre solicitações de novo código (cooldown)
    private static final int COOLDOWN_SECONDS = 30;

    // Memória rápida e thread-safe para armazenar os códigos gerados
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();
    
    // SecureRandom é mais seguro que Math.random() para gerar códigos
    private final SecureRandom random = new SecureRandom();

    /**
     * Registro interno para armazenar o estado do OTP de um cliente.
     */
    private record OtpRecord(String code, Instant expiresAt, Instant lastSentAt, int attempts) {
        public OtpRecord incrementAttempts() {
            return new OtpRecord(code, expiresAt, lastSentAt, attempts + 1);
        }
    }

    /**
     * Gera um novo código de 4 dígitos para o telefone informado e simula o envio.
     */
    public void generateAndSend(String phone) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        if (normalizedPhone.isEmpty()) {
            throw new BadRequestResponse("Telefone inválido.");
        }

        var now = Instant.now();
        var existing = otpStore.get(normalizedPhone);

        // Bloqueia spam de requisições de código (rate limiting simples)
        if (existing != null && existing.lastSentAt().plus(COOLDOWN_SECONDS, ChronoUnit.SECONDS).isAfter(now)) {
            throw new TooManyRequestsResponse("Aguarde um momento antes de solicitar um novo código.");
        }

        // Gera código de 4 dígitos entre 1000 e 9999
        int codeInt = 1000 + random.nextInt(9000);
        String code = String.valueOf(codeInt);

        var expiresAt = now.plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES);
        otpStore.put(normalizedPhone, new OtpRecord(code, expiresAt, now, 0));

        // TODO: Quando integrar uma API real (Twilio, Z-API, etc), substituir o print abaixo pela chamada da API
        System.out.println("\n=================================================");
        System.out.println("📱 [MENSAGEM WHATSAPP] Para: " + phone);
        System.out.println("Seu código de verificação NextCut é: " + code);
        System.out.println("Válido por " + OTP_VALIDITY_MINUTES + " minutos.");
        System.out.println("=================================================\n");
    }

    /**
     * Valida o código digitado pelo usuário. Lança exceções caso algo dê errado.
     */
    public void verify(String phone, String code) {
        var normalizedPhone = PhoneNormalizer.normalize(phone);
        var record = otpStore.get(normalizedPhone);

        // Caso 1: Não existe código pendente
        if (record == null) {
            throw new BadRequestResponse("Nenhum código pendente para este número. Solicite um novo.");
        }

        // Caso 2: Código expirado pelo tempo
        if (Instant.now().isAfter(record.expiresAt())) {
            otpStore.remove(normalizedPhone);
            throw new BadRequestResponse("O código expirou. Solicite um novo.");
        }

        // Caso 3: Muitas tentativas (Brute Force)
        if (record.attempts() >= MAX_ATTEMPTS) {
            otpStore.remove(normalizedPhone);
            throw new TooManyRequestsResponse("Muitas tentativas incorretas. Solicite um novo código.");
        }

        // Caso 4: Código errado
        if (!record.code().equals(code.trim())) {
            otpStore.put(normalizedPhone, record.incrementAttempts());
            throw new BadRequestResponse("Código incorreto. Você tem mais " + (MAX_ATTEMPTS - record.attempts() - 1) + " tentativas.");
        }

        // Sucesso: remove o código para não ser reutilizado por atacantes depois
        otpStore.remove(normalizedPhone);
    }
}
