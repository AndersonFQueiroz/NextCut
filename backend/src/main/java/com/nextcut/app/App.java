package com.nextcut.app;

import com.nextcut.config.AppProperties;
import com.nextcut.config.EnvLoader;

/**
 * Ponto de entrada da aplicação (issue #3 — servidor Javalin na porta configurável, padrão 8080).
 * O EnvLoader carrega automaticamente o arquivo .env, dispensando exportar variáveis manualmente.
 */
public final class App {
    private App() {
    }

    public static void main(String[] args) {
        EnvLoader.load();
        var properties = AppProperties.fromEnvironment();
        AppFactory.create().start(properties.port());
    }
}
