FROM python:3.12-slim

# 1. 시스템 의존성 설치 (psycopg2-binary 및 빌드 도구)
# slim 이미지는 최소한의 패키지만 있으므로, 컴파일이 필요한 라이브러리를 위해 설치해줍니다.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. [핵심] CPU 전용 PyTorch 우선 설치
# 이 한 줄이 수 GB의 CUDA 패키지 다운로드를 막아줍니다.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# 3. requirements.txt 복사 및 설치
# 이 단계는 2번에서 설치된 torch를 인식하고 나머지 가벼운 패키지만 추가 설치합니다.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. 소스 코드 복사 (가장 마지막에 배치)
# 코드만 수정했을 경우, 위쪽의 무거운 설치 과정(1~3번)을 모두 캐시로 건너뜁니다.
COPY . .

# 5. 실행 (현재 app.main 구조에 맞게 설정)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]