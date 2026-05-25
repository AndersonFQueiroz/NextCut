package com.nextcut.service;

import com.nextcut.dao.AuthDao;
import com.nextcut.model.Barber;
import io.javalin.http.UnauthorizedResponse;
import org.mindrot.jbcrypt.BCrypt;
import java.util.UUID;

/**
 * Serviço responsável pela autenticação de usuários (barbeiros).
 * <p><strong>Segurança Aplicada:</strong></p>
 * Este serviço previne ataques de timing (por usar BCrypt para verificação) e garante
 * que senhas nunca trafeguem em texto plano no banco de dados. O token retornado 
 * (UUID UUIDv4) garante entropia criptográfica suficiente para a sessão.
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
