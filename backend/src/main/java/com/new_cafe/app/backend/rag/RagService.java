package com.new_cafe.app.backend.rag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagService {

    private final RagDocumentRepository ragDocumentRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${agent.base.url:http://localhost:8000}")
    private String agentBaseUrl;

    public List<RagDocument> getAllDocuments() {
        return ragDocumentRepository.findAllByOrderByCreatedAtDesc();
    }

    public RagDocument getDocumentById(Long id) {
        return ragDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
    }

    public RagDocument createDocument(String fileName, String content) {
        try {
            // Python agent-server에 임베딩 생성 요청
            String url = agentBaseUrl + "/api/rag/documents";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("file_name", fileName);
            requestBody.put("content", content);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                Long docId = ((Number) responseBody.get("document_id")).longValue();
                
                // DB에서 문서 조회
                return getDocumentById(docId);
            } else {
                throw new RuntimeException("Failed to create document in agent-server");
            }
        } catch (Exception e) {
            log.error("Error creating document: ", e);
            throw new RuntimeException("Failed to create document: " + e.getMessage());
        }
    }

    public RagDocument uploadDocument(MultipartFile file) {
        try {
            if (!file.getOriginalFilename().endsWith(".md")) {
                throw new RuntimeException("Only .md files are supported");
            }

            // Python agent-server에 파일 업로드
            String url = agentBaseUrl + "/api/rag/documents/upload";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            
            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                Long docId = ((Number) responseBody.get("document_id")).longValue();
                
                // DB에서 문서 조회
                return getDocumentById(docId);
            } else {
                throw new RuntimeException("Failed to upload document to agent-server");
            }
        } catch (Exception e) {
            log.error("Error uploading document: ", e);
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
    }

    public RagDocument updateDocument(Long id, String title, String content, String fileName) {
        try {
            // 문서 존재 확인
            RagDocument existingDoc = getDocumentById(id);
            
            // Python agent-server에 업데이트 요청 (임베딩 재생성)
            String url = agentBaseUrl + "/api/rag/documents/" + id;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("title", title);
            requestBody.put("content", content);
            requestBody.put("file_name", fileName);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            restTemplate.put(url, request);
            
            // 업데이트된 문서 조회
            return getDocumentById(id);
        } catch (Exception e) {
            log.error("Error updating document: ", e);
            throw new RuntimeException("Failed to update document: " + e.getMessage());
        }
    }

    public void deleteDocument(Long id) {
        try {
            // 문서 존재 확인
            RagDocument doc = getDocumentById(id);
            
            // Python agent-server에 삭제 요청
            String url = agentBaseUrl + "/api/rag/documents/" + id;
            restTemplate.delete(url);
            
        } catch (Exception e) {
            log.error("Error deleting document: ", e);
            throw new RuntimeException("Failed to delete document: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> searchDocuments(String query, Integer topK) {
        try {
            String url = agentBaseUrl + "/api/rag/search";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("top_k", topK != null ? topK : 5);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                return (List<Map<String, Object>>) responseBody.get("results");
            } else {
                throw new RuntimeException("Failed to search documents");
            }
        } catch (Exception e) {
            log.error("Error searching documents: ", e);
            throw new RuntimeException("Failed to search documents: " + e.getMessage());
        }
    }
}
