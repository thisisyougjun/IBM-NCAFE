package com.new_cafe.app.backend.auth.application.port.in;

public interface LoginUseCase {
    boolean login(LoginCommand command);
}
