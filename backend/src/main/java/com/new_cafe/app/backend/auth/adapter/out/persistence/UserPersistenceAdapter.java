package com.new_cafe.app.backend.auth.adapter.out.persistence;

import com.new_cafe.app.backend.auth.application.port.out.LoadUserPort;
import com.new_cafe.app.backend.auth.domain.User;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserPersistenceAdapter implements LoadUserPort {

    // You would inject your JPA Repository here
    // private final JpaUserRepository userRepository;

    @Override
    public Optional<User> loadUserByUsername(String username) {
        // Here you would use the repository to find the user.
        // For demonstration, we return a mock user.

        // TODO: Replace with real database call
        if ("admin".equals(username)) {
            return Optional.of(new User(1L, "admin", "password"));
        }
        return Optional.empty();
    }
}
