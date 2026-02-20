package com.new_cafe.app.backend.auth.application.port.out;

import com.new_cafe.app.backend.auth.domain.User;
import java.util.Optional;

public interface LoadUserPort {
    Optional<User> loadUserByUsername(String username);
}
