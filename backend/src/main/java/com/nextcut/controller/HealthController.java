package com.nextcut.controller;

import io.javalin.config.RoutesConfig;

public final class HealthController {
    private HealthController() {
    }

    public static void register(RoutesConfig routes) {
        routes.get("/health", ctx -> ctx.json(new HealthResponse("ok")));
    }

    private record HealthResponse(String status) {
    }
}
