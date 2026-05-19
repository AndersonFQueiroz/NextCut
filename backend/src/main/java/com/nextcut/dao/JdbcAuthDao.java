package com.nextcut.dao;

import com.nextcut.config.DatabaseConfig;
import com.nextcut.model.Barber;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;

public class JdbcAuthDao implements AuthDao {
    @Override
    public Optional<Barber> findByUsername(String username) {
        String sql = "SELECT id, username, password_hash, avg_service_minutes, is_open, created_at FROM barber WHERE username = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    var barber = new Barber(
                        UUID.fromString(rs.getString("id")),
                        rs.getString("username"),
                        rs.getString("password_hash"),
                        rs.getInt("avg_service_minutes"),
                        rs.getBoolean("is_open"),
                        rs.getTimestamp("created_at").toInstant()
                    );
                    return Optional.of(barber);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar barbeiro no banco de dados", e);
        }
        return Optional.empty();
    }
}
