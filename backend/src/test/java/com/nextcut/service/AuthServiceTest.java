package com.nextcut.service;

import com.nextcut.dao.AuthDao;
import com.nextcut.model.Barber;
import io.javalin.http.UnauthorizedResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mindrot.jbcrypt.BCrypt;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private AuthDao authDao;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authDao = mock(AuthDao.class);
        authService = new AuthService(authDao);
    }

    @Test
    void authenticatesValidBarberSuccessfully() {
        String username = "barber_bob";
        String password = "secretPassword123";
        String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        Barber mockBarber = new Barber(UUID.randomUUID(), username, passwordHash, 15, true, Instant.now());

        when(authDao.findByUsername(username)).thenReturn(Optional.of(mockBarber));

        String token = authService.login(username, password);

        assertNotNull(token);
        assertDoesNotThrow(() -> UUID.fromString(token));
        verify(authDao).findByUsername(username);
    }

    @Test
    void rejectsInvalidPassword() {
        String username = "barber_bob";
        String password = "secretPassword123";
        String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        Barber mockBarber = new Barber(UUID.randomUUID(), username, passwordHash, 15, true, Instant.now());

        when(authDao.findByUsername(username)).thenReturn(Optional.of(mockBarber));

        assertThrows(UnauthorizedResponse.class, () -> authService.login(username, "wrongPassword"));
    }

    @Test
    void rejectsNonExistingUsername() {
        String username = "unknown_barber";
        when(authDao.findByUsername(username)).thenReturn(Optional.empty());

        assertThrows(UnauthorizedResponse.class, () -> authService.login(username, "anyPassword"));
    }

    @Test
    void rejectsEmptyOrNullCredentials() {
        assertThrows(UnauthorizedResponse.class, () -> authService.login("", "password"));
        assertThrows(UnauthorizedResponse.class, () -> authService.login(null, "password"));
        assertThrows(UnauthorizedResponse.class, () -> authService.login("username", ""));
        assertThrows(UnauthorizedResponse.class, () -> authService.login("username", null));
    }
}
