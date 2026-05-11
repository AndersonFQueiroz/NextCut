package com.nextcut;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExampleTest {

    static class Ping {
        String value() {
            return "noop";
        }
    }

    @Mock
    Ping ping;

    @Test
    void exemploComMockito() {
        when(ping.value()).thenReturn("pong");
        assertEquals("pong", ping.value());
    }
}
