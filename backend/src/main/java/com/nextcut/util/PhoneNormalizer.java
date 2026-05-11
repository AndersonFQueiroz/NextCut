package com.nextcut.util;

import io.javalin.http.BadRequestResponse;

public final class PhoneNormalizer {
    private PhoneNormalizer() {
    }

    public static String normalize(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new BadRequestResponse("Telefone é obrigatório");
        }

        var digitsOnly = phone.replaceAll("\\D", "");
        if (digitsOnly.length() < 10 || digitsOnly.length() > 11) {
            throw new BadRequestResponse("Telefone deve ter 10 ou 11 dígitos");
        }

        return digitsOnly;
    }
}
