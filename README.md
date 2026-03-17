# ☕ Cafe Management System (NCAFE)

> 직관적인 UI/UX와 안정적인 백엔드를 제공하는 컨테이너 기반 카페 관리 및 주문 웹 애플리케이션입니다.

## 📌 Project Overview
**[프로젝트 이름]**은 오프라인 카페의 메뉴 주문과 매장 관리를 위한 종합 솔루션입니다. 
고객은 웹을 통해 손쉽게 메뉴를 탐색하고 주문할 수 있으며, 관리자는 직관적인 백오피스를 통해 메뉴 및 재고를 관리할 수 있습니다. Nginx와 Docker를 적극 활용하여, 배포와 확장이 용이한 마이크로서비스 지향 아키텍처를 구성했습니다.

---

## 🛠 Tech Stack

### 🎨 Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### ⚙️ Backend
![Java](https://img.shields.io/badge/Java%2021-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=Gradle&logoColor=white)

### 🗄️ Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![pgvector](https://img.shields.io/badge/pgvector-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### 🐳 Infrastructure & DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)

---

## ✨ Key Features

### 👨‍💻 관리자 (Admin) 기능
- **메뉴 관리**: 새로운 메뉴 등록, 기존 메뉴 수정 및 삭제 기능
- **상세 관리**: 메뉴 카테고리, 가격, 이미지 및 재고 관련 상세 설정
- **[추가 상세 관리 기능 필요 시 작성 - 예: 주문 내역 조회, 매출 통계 등]**

### 🧑‍💼 사용자 (User) 기능
- **메뉴 조회**: 직관적이고 반응형으로 구현된 디지털 메뉴판 
- **메뉴 주문**: 간단한 과정을 거친 빠르고 정확한 주문 접수
- **[추가 사용자 기능 필요 시 작성 - 예: 챗봇을 통한 메뉴 추천 등]**

---

## 🏗 Architecture & Design

본 프로젝트는 서비스 간 격리와 확장성을 보장하기 위해 **멀티 컨테이너 아키텍처(Multi-container Architecture)**를 채택하였습니다. 

### 🔄 Traffic Flow & Nginx Reverse Proxy
- 클라이언트의 모든 요청은 **Nginx 리버스 프록시**를 최전방 진입점(Entrypoint)으로 거치게 됩니다.
- Nginx는 `/api` 요청은 Backend 컨테이너로, 그 외의 사용자 인터페이스 렌더링 요청은 Frontend(Next.js) 컨테이너로 라우팅(Routing)합니다.
- 이를 통해 클라이언트는 단일 도메인/포트로 접근할 수 있으며, 백엔드 및 기타 컨테이너들의 내부 포트를 외부에 직접 노출하지 않아 전체 시스템의 보안성이 크게 강화됩니다.

### 📦 Docker Compose Structure
- **Frontend Container**: 사용자 접속을 처리하고 인터페이스를 렌더링하는 Next.js 애플리케이션
- **Backend Container**: 핵심 비즈니스 로직 처리 및 REST API를 제공하는 Spring Boot 애플리케이션
- **Agent Server Container**: AI 에이전트 혹은 챗봇과 같은 부가 기능을 담당하는 별도 서버
- **Database Container**: 비즈니스 및 벡터 데이터 저장을 전담하는 PostgreSQL (pgvector) DB

> 외부(Host) 망에는 Nginx 등 필요한 포트만 바인딩되며, 나머지 서비스는 사용자 정의 Docker Network 안에서 안전하게 상호 통신합니다.

### 📁 Directory Structure
```text
.
├── backend/            # Spring Boot 기반 REST API 백엔드
│   ├── src/            # 메인 비즈니스 로직 및 설정 (Java)
│   ├── build.gradle    # 백엔드 의존성 및 빌드 관리
│   └── Dockerfile      # 백엔드 컨테이너 이미지 빌드 설정
├── frontend/           # Next.js 기반 프론트엔드
│   ├── app/            # 라우팅 페이지 및 UI/UX 컴포넌트 (React/TS)
│   ├── public/         # 폰트, 이미지 등 정적 리소스 파일
│   ├── package.json    # 프론트엔드 의존성 관리
│   └── Dockerfile      # 프론트엔드 컨테이너 이미지 빌드 설정
├── agent-server/       # AI 에이전트 및 추가 서비스 서버 (Python 등)
├── socket/             # 소켓 통신 혹은 실시간 처리 관련 컴포넌트
├── upload/             # 업로드된 메뉴 이미지 등 정적 파일 볼륨 디렉터리
├── docker-compose.yml  # 전체 컨테이너 오케스트레이션 및 네트워크 설정
└── init-db.sql         # 데이터베이스 초기화 및 기본 마이그레이션 스크립트
```

---

## 🚀 Getting Started

로컬 환경에서 프로젝트를 즉시 복제하여 빌드하고 실행할 수 있습니다.
사전에 **Docker** 및 **Docker Compose**가 설치되어 있어야 합니다.

```bash
# 1. Repository 클론
git clone [리포지토리 주소]
cd [프로젝트 폴더명]

# 2. 필수 환경 변수 설정
# 프로젝트 루트 혹은 각 디렉터리의 .env.example 파일을 .env로 복사하여 자신의 환경에 맞게 수정합니다.
# (예: DB_PASSWORD, JWT_SECRET, GEMINI_API_KEY 등)
# cp .env.example .env

# 3. Docker Compose 빌드 및 백그라운드 실행
docker compose up --build -d

# 4. 컨테이너 상태 및 로그 확인
docker compose ps
docker compose logs -f
```

### 🌐 서비스 접속
- **Frontend (Web UI)**: 웹 브라우저를 통해 클라이언트 서비스에 접근합니다. (예: `http://localhost:3065` 혹은 Nginx에 설정된 도메인)
- **Backend (API)**: API 엔드포인트에 요청을 전송합니다. (예: `http://localhost:8065/api/`)
- **[기타 서비스]**: [필요 시 Agent 혹은 다른 서비스의 접속 정보를 추가합니다.]

---
> 해당 프로젝트는 원칙적으로 자유로운 수정이 가능합니다. 개발 과정 중 도움이 필요하거나 문제(Issue)가 발생하면 Repository의 Issues 탭에 남겨주세요.
