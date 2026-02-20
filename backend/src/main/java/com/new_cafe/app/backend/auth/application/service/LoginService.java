package com.new_cafe.app.backend.auth.application.service;

import com.new_cafe.app.backend.auth.application.port.in.LoginCommand;
import com.new_cafe.app.backend.auth.application.port.in.LoginUseCase;
import com.new_cafe.app.backend.auth.application.port.out.LoadUserPort;
import com.new_cafe.app.backend.auth.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginService implements LoginUseCase {

    private final LoadUserPort loadUserPort;

    @Override
    public boolean login(LoginCommand command) {
        // Here starts the actual implementation of the business logic.
        // For structure purposes, we'll implement a simple check.
        // The user mentioned "I will implement the auth part myself",
        // so I will leave a clear place for their logic.

        Optional<User> userOptional = loadUserPort.loadUserByUsername(command.username());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // TODO: Implement your password checking or token generation logic here.
            // For now, we return true if password matches (simplistic check)
            return user.getPassword().equals(command.password());
        }

        return false;
    }
}
