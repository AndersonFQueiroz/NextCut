package com.nextcut.dao;

import com.nextcut.config.DatabaseConfig;
import com.nextcut.model.QueueEntry;
import com.nextcut.model.QueueStatus;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementação JDBC para persistência de entradas na fila.
 * Utiliza SQL nativo com PreparedStatements para garantir segurança e performance.
 */
public class JdbcQueueEntryDao implements QueueEntryDao {

    /**
     * Salva uma nova entrada de cliente no banco de dados.
     * @param entry Objeto contendo os dados do cliente e sua posição.
     * @return A própria entrada salva para encadeamento.
     */
    @Override
    public QueueEntry save(QueueEntry entry) {
        var sql = """
                INSERT INTO queue_entries
                    (id, ticket_number, client_name, client_phone,
                     status, position, entered_at, entered_date)
                VALUES (?, ?, ?, ?, CAST(? AS queue_status), ?, ?, CURRENT_DATE)
                """;
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, entry.id());
            stmt.setInt(2, entry.ticketNumber());
            stmt.setString(3, entry.clientName());
            stmt.setString(4, entry.clientPhone());
            stmt.setString(5, entry.status().name());
            stmt.setInt(6, entry.position());
            stmt.setTimestamp(7, Timestamp.from(entry.enteredAt()));
            stmt.executeUpdate();
            return entry;

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar entrada na fila: " + e.getMessage(), e);
        }
    }

    /**
     * Busca uma entrada ativa (WAITING) vinculada a um número de telefone no dia atual.
     * @param phone Telefone do cliente.
     * @return Optional contendo a entrada se encontrada.
     */
    @Override
    public Optional<QueueEntry> findWaitingByPhone(String phone) {
        var sql = """
                SELECT id, ticket_number, client_name, client_phone,
                       status, position, entered_at, called_at
                FROM queue_entries
                WHERE client_phone = ?
                  AND status = 'WAITING'
                  AND entered_date = CURRENT_DATE
                ORDER BY entered_at DESC
                LIMIT 1
                """;
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, phone);
            try (var rs = stmt.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar entrada por telefone: " + e.getMessage(), e);
        }
    }

    /**
     * Retorna todos os clientes que estão aguardando atendimento hoje, ordenados por posição.
     * @return Lista de entradas com status WAITING.
     */
    @Override
    public List<QueueEntry> findWaitingEntries() {
        var sql = """
                SELECT id, ticket_number, client_name, client_phone,
                       status, position, entered_at, called_at
                FROM queue_entries
                WHERE status = 'WAITING'
                  AND entered_date = CURRENT_DATE
                ORDER BY position ASC
                """;
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql);
             var rs = stmt.executeQuery()) {

            var entries = new ArrayList<QueueEntry>();
            while (rs.next()) entries.add(mapRow(rs));
            return entries;

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fila em espera: " + e.getMessage(), e);
        }
    }

    /**
     * Atualiza os dados de uma entrada existente (status, posição e data de chamada).
     * @param entry Objeto QueueEntry com os dados atualizados.
     */
    @Override
    public void update(QueueEntry entry) {
        var sql = """
                UPDATE queue_entries
                SET status    = CAST(? AS queue_status),
                    position  = ?,
                    called_at = ?
                WHERE id = ?
                """;
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, entry.status().name());
            stmt.setInt(2, entry.position());
            stmt.setTimestamp(3,
                    entry.calledAt() != null ? Timestamp.from(entry.calledAt()) : null);
            stmt.setObject(4, entry.id());
            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar entrada na fila: " + e.getMessage(), e);
        }
    }

    /**
     * Atualiza apenas o status de uma entrada. Se o novo status for IN_SERVICE,
     * registra automaticamente o momento da chamada (called_at).
     * @param id UUID da entrada.
     * @param status Novo status (ex: IN_SERVICE, COMPLETED, CANCELLED).
     */
    @Override
    public void updateStatus(UUID id, QueueStatus status) {
        var sql = """
                UPDATE queue_entries
                SET status    = CAST(? AS queue_status),
                    called_at = CASE
                                    WHEN CAST(? AS queue_status) = 'IN_SERVICE'
                                    THEN NOW()
                                    ELSE called_at
                                END
                WHERE id = ?
                """;
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status.name());
            stmt.setString(2, status.name());
            stmt.setObject(3, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar status: " + e.getMessage(), e);
        }
    }

    /**
     * Recalcula sequencialmente a posição de todos os clientes em espera hoje.
     * Útil após remoções ou cancelamentos para manter a fila íntegra.
     */
    @Override
    public void updatePositions() {
        var sql = """
                UPDATE queue_entries
                SET position = sub.nova_posicao
                FROM (
                    SELECT id,
                           ROW_NUMBER() OVER (ORDER BY entered_at ASC) AS nova_posicao
                    FROM queue_entries
                    WHERE status = 'WAITING'
                      AND entered_date = CURRENT_DATE
                ) sub
                WHERE queue_entries.id = sub.id
                """;
        try (var conn = DatabaseConfig.getConnection();
             var stmt = conn.prepareStatement(sql)) {

            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Erro ao recalcular posições da fila: " + e.getMessage(), e);
        }
    }

    // ── Mapeamento ResultSet → QueueEntry ─────────────────────
    private QueueEntry mapRow(ResultSet rs) throws SQLException {
        var calledAtTs = rs.getTimestamp("called_at");
        return new QueueEntry(
                UUID.fromString(rs.getString("id")),
                rs.getInt("ticket_number"),
                rs.getString("client_name"),
                rs.getString("client_phone"),
                QueueStatus.valueOf(rs.getString("status")),
                rs.getInt("position"),
                rs.getTimestamp("entered_at").toInstant(),
                calledAtTs != null ? calledAtTs.toInstant() : null
        );
    }
}
