package com.new_cafe.app.backend.user.adapter.out.persistence;

import com.new_cafe.app.backend.user.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
