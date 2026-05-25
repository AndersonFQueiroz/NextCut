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
                    return Optional.of(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar barbeiro no banco de dados", e);
        }
        return Optional.empty();
    }

    @Override
    public Optional<Barber> getBarberConfig() {
        var sql = "SELECT id, username, password_hash, avg_service_minutes, is_open, created_at FROM barber LIMIT 1";
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql);
             var rs = stmt.executeQuery()) {
            if (rs.next()) {
                return Optional.of(mapRow(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar configurações do barbeiro", e);
        }
        return Optional.empty();
    }

    @Override
    public boolean toggleShopStatus() {
        var sql = "UPDATE barber SET is_open = NOT is_open RETURNING is_open";
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql);
             var rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getBoolean("is_open");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao alternar status da barbearia", e);
        }
        throw new RuntimeException("Nenhum barbeiro encontrado para alternar status");
    }

    private Barber mapRow(ResultSet rs) throws SQLException {
        return new Barber(
            UUID.fromString(rs.getString("id")),
            rs.getString("username"),
            rs.getString("password_hash"),
            rs.getInt("avg_service_minutes"),
            rs.getBoolean("is_open"),
            rs.getTimestamp("created_at").toInstant()
        );
    }
}
