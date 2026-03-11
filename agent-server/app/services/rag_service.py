"""
RAG 문서 임베딩 및 검색 서비스
- multilingual-e5-large 모델 사용
- 문서 임베딩 생성
- 시맨틱 검색
"""
import os
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
import psycopg2
from psycopg2.extras import RealDictCursor


class RAGService:
    def __init__(self):
        # multilingual-e5-large 모델 로드 (1024 차원)
        self.model = SentenceTransformer('intfloat/multilingual-e5-large')
        self.embedding_dim = 1024
        
        # DB 연결 정보
        self.db_config = {
            'dbname': os.getenv('POSTGRES_DB', 'ncafedb'),
            'user': os.getenv('POSTGRES_USER', 'ncafe'),
            'password': os.getenv('DB_PASSWORD', 'ncafe1234'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5433')
        }
    
    def get_connection(self):
        """데이터베이스 연결"""
        return psycopg2.connect(**self.db_config)
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        텍스트를 임베딩 벡터로 변환
        multilingual-e5-large는 쿼리 앞에 "query: " 또는 "passage: " 접두사를 권장
        """
        # 문서 저장 시에는 "passage: " 접두사 사용
        embedding = self.model.encode(f"passage: {text}", normalize_embeddings=True)
        return embedding.tolist()
    
    def generate_query_embedding(self, query: str) -> List[float]:
        """
        검색 쿼리를 임베딩 벡터로 변환
        """
        # 검색 시에는 "query: " 접두사 사용
        embedding = self.model.encode(f"query: {query}", normalize_embeddings=True)
        return embedding.tolist()
    
    def parse_markdown(self, content: str, file_name: str) -> dict:
        """
        마크다운 파일 파싱
        제목 추출 (첫 번째 # 헤더)
        """
        lines = content.strip().split('\n')
        title = file_name  # 기본값
        
        # 첫 번째 # 헤더를 제목으로 사용
        for line in lines:
            if line.startswith('# '):
                title = line[2:].strip()
                break
        
        return {
            'title': title,
            'content': content
        }
    
    def create_document(self, file_name: str, content: str) -> Optional[int]:
        """
        RAG 문서 생성 (임베딩 포함)
        """
        try:
            # 마크다운 파싱
            parsed = self.parse_markdown(content, file_name)
            
            # 임베딩 생성
            embedding = self.generate_embedding(parsed['content'])
            
            # DB에 저장
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO rag_documents (title, content, file_name, embedding)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (parsed['title'], parsed['content'], file_name, embedding)
            )
            
            doc_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            
            return doc_id
        except Exception as e:
            print(f"Error creating document: {e}")
            return None
    
    def update_document(self, doc_id: int, title: str, content: str, file_name: str) -> bool:
        """
        RAG 문서 업데이트 (임베딩 재생성)
        """
        try:
            # 임베딩 생성
            embedding = self.generate_embedding(content)
            
            # DB 업데이트
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                """
                UPDATE rag_documents
                SET title = %s, content = %s, file_name = %s, embedding = %s
                WHERE id = %s
                """,
                (title, content, file_name, embedding, doc_id)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Error updating document: {e}")
            return False
    
    def search_documents(self, query: str, top_k: int = 5) -> List[dict]:
        """
        시맨틱 검색 - 쿼리와 유사한 문서 검색
        """
        try:
            # 쿼리 임베딩 생성
            query_embedding = self.generate_query_embedding(query)
            
            # 코사인 유사도로 검색
            conn = self.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                """
                SELECT 
                    id, 
                    title, 
                    content, 
                    file_name,
                    created_at,
                    updated_at,
                    1 - (embedding <=> %s::vector) as similarity
                FROM rag_documents
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (query_embedding, query_embedding, top_k)
            )
            
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return [dict(row) for row in results]
        except Exception as e:
            print(f"Error searching documents: {e}")
            return []
    
    def get_all_documents(self) -> List[dict]:
        """
        모든 문서 조회
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                """
                SELECT id, title, file_name, created_at, updated_at
                FROM rag_documents
                ORDER BY created_at DESC
                """
            )
            
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return [dict(row) for row in results]
        except Exception as e:
            print(f"Error getting documents: {e}")
            return []
    
    def get_document_by_id(self, doc_id: int) -> Optional[dict]:
        """
        ID로 문서 조회
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute(
                """
                SELECT id, title, content, file_name, created_at, updated_at
                FROM rag_documents
                WHERE id = %s
                """,
                (doc_id,)
            )
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            return dict(result) if result else None
        except Exception as e:
            print(f"Error getting document: {e}")
            return None
    
    def delete_document(self, doc_id: int) -> bool:
        """
        문서 삭제
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "DELETE FROM rag_documents WHERE id = %s",
                (doc_id,)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Error deleting document: {e}")
            return False


# 싱글톤 인스턴스
rag_service = RAGService()
