-- pgvector 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- RAG 문서 테이블 생성
CREATE TABLE IF NOT EXISTS rag_documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    embedding vector(1024),  -- multilingual-e5-large는 1024 차원
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 벡터 유사도 검색을 위한 인덱스 생성 (HNSW 알고리즘)
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx 
ON rag_documents 
USING hnsw (embedding vector_cosine_ops);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거
CREATE TRIGGER update_rag_documents_updated_at 
BEFORE UPDATE ON rag_documents 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
