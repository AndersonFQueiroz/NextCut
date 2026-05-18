package com.nextcut.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class DatabaseConfigTest {
    @Test
    void extractsCredentialsFromDatabaseUrlQueryParameters() {
        var properties = DatabaseConfig.connectionProperties(
            "jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres"
                + "?user=postgres.projectref&password=secret&sslmode=require"
        );

        assertEquals("postgres.projectref", properties.getProperty("user"));
        assertEquals("secret", properties.getProperty("password"));
    }

    @Test
    void extractsCredentialsWhenQueryParametersHaveExtraWhitespace() {
        var properties = DatabaseConfig.connectionProperties(
            "jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres"
                + "? user=postgres.projectref&password=secret&sslmode=require"
        );

        assertEquals("postgres.projectref", properties.getProperty("user"));
        assertEquals("secret", properties.getProperty("password"));
    }

    @Test
    void opensConnectionWhenDatabaseUrlIsConfigured() throws Exception {
        assumeTrue(System.getenv("DATABASE_URL") != null && !System.getenv("DATABASE_URL").isBlank());

        try (var connection = DatabaseConfig.getConnection()) {
            assertTrue(connection.isValid(5));
        }
    }
}
