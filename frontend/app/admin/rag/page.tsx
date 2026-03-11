"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Search, Edit, Trash2, FileText, Plus, X } from "lucide-react";
import styles from "./page.module.css";
import toast from "react-hot-toast";

interface RagDocument {
  id: number;
  title: string;
  content: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

export default function RagManagementPage() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<RagDocument | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 문서 목록 조회
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/rag/documents");
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("문서 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 파일 업로드
  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".md")) {
      toast.error("마크다운(.md) 파일만 업로드 가능합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("/api/admin/rag/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        toast.success("문서가 업로드되었습니다.");
        fetchDocuments();
      } else {
        toast.error(data.message || "업로드 실패");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop 핸들러
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // 문서 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 문서를 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/rag/documents/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("문서가 삭제되었습니다.");
        fetchDocuments();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 문서 수정
  const handleEdit = (doc: RagDocument) => {
    setSelectedDoc(doc);
    setIsEditModalOpen(true);
  };

  // 문서 생성
  const handleCreate = () => {
    setSelectedDoc(null);
    setIsCreateModalOpen(true);
  };

  // 필터링된 문서 목록
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>RAG 문서 관리</h1>
          <p className={styles.subtitle}>
            AI 챗봇이 참조할 지식 문서를 관리합니다
          </p>
        </div>
        <button onClick={handleCreate} className={styles.createButton}>
          <Plus size={20} />
          새 문서 작성
        </button>
      </div>

      {/* 업로드 영역 */}
      <div
        className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={styles.uploadIcon} size={48} />
        <h3>마크다운 파일을 드래그하거나 클릭하여 업로드</h3>
        <p>.md 파일만 지원됩니다</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>

      {/* 검색 바 */}
      <div className={styles.searchBar}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="문서 제목 또는 파일명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* 문서 목록 */}
      <div className={styles.documentList}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={64} className={styles.emptyIcon} />
            <p>문서가 없습니다</p>
            <p className={styles.emptySubtext}>
              첫 번째 문서를 업로드해보세요!
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <FileText className={styles.cardIcon} size={24} />
                  <h3 className={styles.cardTitle}>{doc.title}</h3>
                </div>
                <p className={styles.cardFileName}>{doc.fileName}</p>
                <p className={styles.cardContent}>
                  {doc.content.substring(0, 150)}...
                </p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardDate}>
                    {new Date(doc.updatedAt).toLocaleDateString("ko-KR")}
                  </span>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEdit(doc)}
                      className={styles.actionButton}
                      title="수정"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 수정/생성 모달 */}
      {(isEditModalOpen || isCreateModalOpen) && (
        <DocumentModal
          document={selectedDoc}
          onClose={() => {
            setIsEditModalOpen(false);
            setIsCreateModalOpen(false);
          }}
          onSave={() => {
            fetchDocuments();
            setIsEditModalOpen(false);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// 문서 수정/생성 모달 컴포넌트
function DocumentModal({
  document,
  onClose,
  onSave,
}: {
  document: RagDocument | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState(document?.title || "");
  const [content, setContent] = useState(document?.content || "");
  const [fileName, setFileName] = useState(document?.fileName || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !fileName) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const url = document
        ? `/api/admin/rag/documents/${document.id}`
        : "/api/admin/rag/documents";
      const method = document ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, fileName }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(document ? "문서가 수정되었습니다." : "문서가 생성되었습니다.");
        onSave();
      } else {
        toast.error(data.message || "저장 실패");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{document ? "문서 수정" : "새 문서 작성"}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문서 제목"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="fileName">파일명</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="example.md"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="content">내용 (Markdown)</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# 제목&#10;&#10;내용을 입력하세요..."
              className={styles.textarea}
              rows={15}
            />
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
