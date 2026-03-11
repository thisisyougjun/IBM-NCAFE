"""
RAG 관련 API 라우터
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api/rag", tags=["RAG"])


class DocumentCreate(BaseModel):
    file_name: str
    content: str


class DocumentUpdate(BaseModel):
    title: str
    content: str
    file_name: str


class SearchQuery(BaseModel):
    query: str
    top_k: Optional[int] = 5


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    마크다운 파일 업로드 및 임베딩 생성
    """
    if not file.filename.endswith('.md'):
        raise HTTPException(status_code=400, detail="Only .md files are supported")
    
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        doc_id = rag_service.create_document(file.filename, content_str)
        
        if doc_id is None:
            raise HTTPException(status_code=500, detail="Failed to create document")
        
        return {
            "success": True,
            "document_id": doc_id,
            "message": "Document uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents")
async def create_document(doc: DocumentCreate):
    """
    텍스트로 문서 생성
    """
    try:
        doc_id = rag_service.create_document(doc.file_name, doc.content)
        
        if doc_id is None:
            raise HTTPException(status_code=500, detail="Failed to create document")
        
        return {
            "success": True,
            "document_id": doc_id,
            "message": "Document created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
async def get_all_documents():
    """
    모든 문서 목록 조회
    """
    try:
        documents = rag_service.get_all_documents()
        return {
            "success": True,
            "documents": documents,
            "count": len(documents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents/{doc_id}")
async def get_document(doc_id: int):
    """
    특정 문서 조회
    """
    try:
        document = rag_service.get_document_by_id(doc_id)
        
        if document is None:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "success": True,
            "document": document
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/documents/{doc_id}")
async def update_document(doc_id: int, doc: DocumentUpdate):
    """
    문서 업데이트 (임베딩 재생성)
    """
    try:
        success = rag_service.update_document(
            doc_id,
            doc.title,
            doc.content,
            doc.file_name
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update document")
        
        return {
            "success": True,
            "message": "Document updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: int):
    """
    문서 삭제
    """
    try:
        success = rag_service.delete_document(doc_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete document")
        
        return {
            "success": True,
            "message": "Document deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_documents(query: SearchQuery):
    """
    시맨틱 검색 - 쿼리와 유사한 문서 검색
    """
    try:
        results = rag_service.search_documents(query.query, query.top_k)
        
        return {
            "success": True,
            "query": query.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-embedding")
async def generate_embedding(text: str):
    """
    텍스트 임베딩 생성 (테스트용)
    """
    try:
        embedding = rag_service.generate_embedding(text)
        
        return {
            "success": True,
            "dimension": len(embedding),
            "embedding": embedding[:10]  # 처음 10개만 반환
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
