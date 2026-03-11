package com.new_cafe.app.backend.rag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/rag")
@RequiredArgsConstructor
@Slf4j
public class RagController {

    private final RagService ragService;

    @GetMapping("/documents")
    public ResponseEntity<Map<String, Object>> getAllDocuments() {
        try {
            List<RagDocument> documents = ragService.getAllDocuments();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documents", documents);
            response.put("count", documents.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting all documents: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<Map<String, Object>> getDocument(@PathVariable Long id) {
        try {
            RagDocument document = ragService.getDocumentById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting document: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping("/documents/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            RagDocument document = ragService.uploadDocument(file);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);
            response.put("message", "Document uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading document: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/documents")
    public ResponseEntity<Map<String, Object>> createDocument(@RequestBody Map<String, String> request) {
        try {
            String fileName = request.get("fileName");
            String content = request.get("content");
            
            RagDocument document = ragService.createDocument(fileName, content);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);
            response.put("message", "Document created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating document: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/documents/{id}")
    public ResponseEntity<Map<String, Object>> updateDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String title = request.get("title");
            String content = request.get("content");
            String fileName = request.get("fileName");
            
            RagDocument document = ragService.updateDocument(id, title, content, fileName);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("document", document);
            response.put("message", "Document updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating document: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable Long id) {
        try {
            ragService.deleteDocument(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Document deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting document: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> searchDocuments(@RequestBody Map<String, Object> request) {
        try {
            String query = (String) request.get("query");
            Integer topK = request.containsKey("topK") ? (Integer) request.get("topK") : 5;
            
            List<Map<String, Object>> results = ragService.searchDocuments(query, topK);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("query", query);
            response.put("results", results);
            response.put("count", results.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching documents: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
