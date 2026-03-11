package com.new_cafe.app.backend.rag;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RagDocumentRepository extends JpaRepository<RagDocument, Long> {
    List<RagDocument> findAllByOrderByCreatedAtDesc();
}
