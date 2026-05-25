package com.nextcut.dao;

import com.nextcut.model.Barber;
import java.util.Optional;

public interface AuthDao {
    Optional<Barber> findByUsername(String username);

    /**
     * Retorna as configurações do barbeiro (is_open, avg_service_minutes).
     * Usa o primeiro registro da tabela barber.
     */
    Optional<Barber> getBarberConfig();

    /**
     * Alterna o estado de funcionamento da barbearia (is_open) e retorna o novo estado.
     */
    boolean toggleShopStatus();
}
