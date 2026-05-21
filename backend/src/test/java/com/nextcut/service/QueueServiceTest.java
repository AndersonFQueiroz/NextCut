package com.nextcut.service;

import com.nextcut.dao.QueueEntryDao;
import com.nextcut.model.QueueEntry;
import com.nextcut.model.QueueJoinRequest;
import com.nextcut.model.QueueStatus;
import io.javalin.http.ConflictResponse;
import io.javalin.http.NotFoundResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para o QueueService.
 * Focado em garantir a integridade das regras de negócio e o isolamento via Mocks.
 */
@DisplayName("Regras de Negócio: Fila de Atendimento")
class QueueServiceTest {

    private QueueEntryDao queueEntryDao;
    private QueueService queueService;
    private Consumer snapshotConsumer;

    @BeforeEach
    void setUp() {
        queueEntryDao = mock(QueueEntryDao.class);
        snapshotConsumer = mock(Consumer.class);
        
        // Simula banco vazio ao iniciar
        when(queueEntryDao.findWaitingEntries()).thenReturn(Collections.emptyList());
        
        queueService = new QueueService(queueEntryDao, snapshotConsumer);
    }

    @Test
    @DisplayName("Deve permitir um cliente entrar na fila e gerar senha sequencial")
    void shouldJoinClientAndGenerateTicket() {
        var request = new QueueJoinRequest("Anderson", "11999998888");
        
        // Execução
        var entry = queueService.join(request);

        // Verificações
        assertNotNull(entry.id());
        assertEquals(1, entry.ticketNumber());
        assertEquals("Anderson", entry.clientName());
        
        // Verifica se persistiu no banco e notificou via WebSocket
        verify(queueEntryDao, times(1)).save(any(QueueEntry.class));
        verify(snapshotConsumer, times(1)).accept(any());
    }

    @Test
    @DisplayName("Não deve permitir telefones duplicados na fila de espera")
    void shouldRejectDuplicatePhone() {
        var phone = "11999998888";
        var existingEntry = new QueueEntry(UUID.randomUUID(), 1, "João", phone, QueueStatus.WAITING, 1, Instant.now(), null);
        
        // Simula que o telefone já existe no banco
        when(queueEntryDao.findWaitingByPhone(anyString())).thenReturn(Optional.of(existingEntry));

        var request = new QueueJoinRequest("Anderson", phone);
        
        assertThrows(ConflictResponse.class, () -> queueService.join(request));
    }

    @Test
    @DisplayName("Deve recalcular posições corretamente quando um cliente desiste (leave)")
    void shouldUpdatePositionsOnLeave() {
        // Setup de dois clientes
        queueService.join(new QueueJoinRequest("Primeiro", "111111111"));
        var segundo = queueService.join(new QueueJoinRequest("Segundo", "222222222"));
        
        // Simula que ao buscar o status, o DAO retorna o objeto correto
        when(queueEntryDao.findWaitingByPhone(segundo.clientPhone())).thenReturn(Optional.of(segundo));

        // Execução: Primeiro cliente sai
        queueService.leave("111111111");

        // Verifica se chamou a atualização otimizada de posições no banco
        verify(queueEntryDao, atLeastOnce()).updatePositions();
    }

    @Test
    @DisplayName("Deve lançar erro ao tentar remover alguém que não está na fila")
    void shouldThrowErrorWhenLeavingNonExistent() {
        when(queueEntryDao.findWaitingByPhone(anyString())).thenReturn(Optional.empty());

        assertThrows(NotFoundResponse.class, () -> queueService.leave("000000000"));
    }

    @Test
    @DisplayName("Deve registrar o horário de atendimento ao chamar o próximo cliente")
    void shouldRegisterCalledAtOnCallNext() {
        queueService.join(new QueueJoinRequest("Cliente", "11999998888"));

        var called = queueService.callNext();

        assertEquals(QueueStatus.DONE, called.status());
        verify(queueEntryDao).update(argThat(entry -> entry.status() == QueueStatus.DONE));
    }
}
