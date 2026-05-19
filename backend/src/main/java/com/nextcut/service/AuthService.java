package com.nextcut.service;

import com.nextcut.dao.AuthDao;
import com.nextcut.model.Barber;
import io.javalin.http.UnauthorizedResponse;
import org.mindrot.jbcrypt.BCrypt;
import java.util.UUID;

public class AuthService {
    private final AuthDao authDao;

    public AuthService(AuthDao authDao) {
        this.authDao = authDao;
    }

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
