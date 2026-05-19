package com.nextcut.dao;

import com.nextcut.model.Barber;
import java.util.Optional;

public interface AuthDao {
    Optional<Barber> findByUsername(String username);
}
