package com.nextcut.config;

public record AppProperties(int port) {
    private static final int DEFAULT_PORT = 8080;

    public static AppProperties fromEnvironment() {
        var rawPort = System.getenv("PORT");
        if (rawPort == null || rawPort.isBlank()) {
            return new AppProperties(DEFAULT_PORT);
        }

        try {
            return new AppProperties(Integer.parseInt(rawPort));
        } catch (NumberFormatException exception) {
            return new AppProperties(DEFAULT_PORT);
        }
    }
}
