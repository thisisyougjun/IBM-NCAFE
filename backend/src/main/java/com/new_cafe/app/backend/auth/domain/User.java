package com.new_cafe.app.backend.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class User {
    private final Long id;
    private final String username;
    private final String password;

    public boolean checkPassword(String password) {
        // In a real application, you should use a password encoder here.
        // For this example, we assume plain text or handled by the caller.
        // The user said they will implement the auth logic, so this is just structure.
        return this.password.equals(password);
    }
}
