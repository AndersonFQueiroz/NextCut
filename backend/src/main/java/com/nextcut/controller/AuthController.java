package com.nextcut.controller;

import com.nextcut.service.AuthService;
import io.javalin.config.RoutesConfig;

public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public void register(RoutesConfig routes) {
        routes.post("/login", ctx -> {
            var loginRequest = ctx.bodyAsClass(LoginRequest.class);
            var token = authService.login(loginRequest.username(), loginRequest.password());
            ctx.status(200).json(ApiResponse.ok(new LoginResponse(token)));
        });
    }

    private record LoginRequest(String username, String password) {
    }

    private record LoginResponse(String token) {
    }
}
