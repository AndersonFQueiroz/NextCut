package com.nextcut.service;

import com.nextcut.dao.AuthDao;
import com.nextcut.model.Barber;
import io.javalin.http.UnauthorizedResponse;
import org.mindrot.jbcrypt.BCrypt;
import java.util.UUID;

/**
 * Serviço responsável pela autenticação de usuários (barbeiros).
 * Gerencia a lógica de validação de credenciais e geração de tokens.
 */
public class AuthService {
    private final AuthDao authDao;

    public AuthService(AuthDao authDao) {
        this.authDao = authDao;
    }

    /**
     * Realiza o login do usuário validando o nome de usuário e a senha hasheada (BCrypt).
     * 
     * @param username Nome de usuário.
     * @param password Senha em texto plano.
     * @return Um token (UUID) se a autenticação for bem-sucedida.
     * @throws UnauthorizedResponse Se as credenciais forem inválidas.
     */
    public String login(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new UnauthorizedResponse("Credenciais inválidas");
        }

        Barber barber = authDao.findByUsername(username)
            .orElseThrow(() -> new UnauthorizedResponse("Credenciais inválidas"));

        if (!BCrypt.checkpw(password, barber.passwordHash())) {
            throw new UnauthorizedResponse("Credenciais inválidas");
        }

        return UUID.randomUUID().toString();
    }
}
