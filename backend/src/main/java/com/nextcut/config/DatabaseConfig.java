package com.nextcut.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DatabaseConfig {
    private static final String DATABASE_URL_ENV = "DATABASE_URL";

    private DatabaseConfig() {
    }

    public static Connection getConnection() throws SQLException {
        var databaseUrl = System.getenv(DATABASE_URL_ENV);
        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL environment variable is required");
        }

        return DriverManager.getConnection(databaseUrl, connectionProperties(databaseUrl));
    }

    static Properties connectionProperties(String databaseUrl) {
        var properties = new Properties();
        var queryStart = databaseUrl.indexOf('?');
        if (queryStart < 0 || queryStart == databaseUrl.length() - 1) {
            validateSupabasePoolerUser(databaseUrl, properties);
            return properties;
        }

        var query = databaseUrl.substring(queryStart + 1);
        for (String rawParameter : query.split("&")) {
            var parameter = rawParameter.strip();
            var separator = parameter.indexOf('=');
            if (separator < 0) {
                continue;
            }

            var key = parameter.substring(0, separator).strip();
            if ("user".equals(key) || "password".equals(key)) {
                properties.setProperty(key, parameter.substring(separator + 1));
            }
        }

        validateSupabasePoolerUser(databaseUrl, properties);
        return properties;
    }

    private static void validateSupabasePoolerUser(String databaseUrl, Properties properties) {
        if (databaseUrl.contains(".pooler.supabase.com") && !properties.containsKey("user")) {
            throw new IllegalStateException(
                "Supabase pooler DATABASE_URL must include user=postgres.<project-ref>. Current value: "
                    + maskPassword(databaseUrl)
            );
        }
    }

    private static String maskPassword(String databaseUrl) {
        return databaseUrl.replaceAll("password=[^&]*", "password=***");
    }
}
