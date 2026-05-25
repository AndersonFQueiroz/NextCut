package com.nextcut.service;

import com.nextcut.dao.AuthDao;
import com.nextcut.dao.InMemoryQueueEntryDao;
import com.nextcut.model.QueueJoinRequest;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.ConflictResponse;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class QueueServiceTest {
    private AuthDao mockAuthDao() {
        var dao = mock(AuthDao.class);
        when(dao.getBarberConfig()).thenReturn(Optional.empty());
        return dao;
    }

    @Test
    void joinsClientsUsingFifoOrderAndSequentialTickets() {
        var service = new QueueService(new InMemoryQueueEntryDao(), mockAuthDao(), snapshot -> {
        });

        var first = service.join(new QueueJoinRequest("Ana", "(11) 99999-0001"));
        var second = service.join(new QueueJoinRequest("Bruno", "(11) 99999-0002"));

        assertEquals(1, first.ticketNumber());
        assertEquals(2, second.ticketNumber());
        assertEquals("Ana", service.callNext().clientName());
        assertEquals(1, service.statusByPhone("(11) 99999-0002").position());
    }

    @Test
    void rejectsDuplicatedWaitingPhone() {
        var service = new QueueService(new InMemoryQueueEntryDao(), mockAuthDao(), snapshot -> {
        });

        service.join(new QueueJoinRequest("Ana", "(11) 99999-0001"));

        assertThrows(
            ConflictResponse.class,
            () -> service.join(new QueueJoinRequest("Ana Silva", "11999990001"))
        );
    }

    @Test
    void validatesRequiredFields() {
        var service = new QueueService(new InMemoryQueueEntryDao(), mockAuthDao(), snapshot -> {
        });

        assertThrows(BadRequestResponse.class, () -> service.join(new QueueJoinRequest("", "11999990001")));
        assertThrows(BadRequestResponse.class, () -> service.join(new QueueJoinRequest("Ana", "123")));
    }
}
