# Fast API 를 이용한 서버 구성

## 1. Gemini를 이용한 연동
## 2. SSE 스트리밍 응답
## 3. 대화 히스토리를 관리

# 패키지 설치

```bash
    pip install fastapi uvicorn google-genai python-dotenv sse-starletter

```

# 아키텍처

## 디렉토리 구조

### 3계층 아키텍처

ai-agent/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── routers/
│   │   └── chat.py
│   ├── services/
│   │   └── gemini.py
│   └── models/
│       └── schemas.py
├── .env
└── requirements.txt