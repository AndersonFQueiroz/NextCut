package com.nextcut.app;

import com.nextcut.config.AppProperties;

/**
 * Ponto de entrada da aplicação (issue #3 — servidor Javalin na porta configurável, padrão 8080).
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) {
        var properties = AppProperties.fromEnvironment();
        AppFactory.create().start(properties.port());
    }
}
