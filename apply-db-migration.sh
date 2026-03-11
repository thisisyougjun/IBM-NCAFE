#!/bin/bash

# =============================================
# NCAFE DB Migration Script v2.0
# 배포 서버에 DB 스키마를 적용하는 스크립트
# =============================================

set -e  # 에러 발생 시 스크립트 중단

echo "========================================"
echo "NCAFE DB Migration v2.0"
echo "========================================"
echo ""

# 1. DB 컨테이너 확인
echo "[1/4] DB 컨테이너 확인 중..."
if ! docker ps | grep -q "yj-dev-db"; then
    echo "❌ 오류: yj-dev-db 컨테이너가 실행 중이지 않습니다."
    echo "다음 명령어로 컨테이너를 시작하세요:"
    echo "  docker compose --profile with-db up -d"
    exit 1
fi
echo "✅ DB 컨테이너 실행 중"
echo ""

# 2. 백업 생성
echo "[2/4] 현재 DB 백업 생성 중..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec yj-dev-db pg_dump -U ncafe -d ncafedb > "$BACKUP_FILE" 2>/dev/null || {
    echo "⚠️  경고: 백업 생성 실패 (DB가 비어있을 수 있음)"
}
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo "✅ 백업 완료: $BACKUP_FILE"
else
    echo "⚠️  백업 파일이 비어있음 (새 DB인 경우 정상)"
fi
echo ""

# 3. 스키마 마이그레이션 적용
echo "[3/4] 스키마 마이그레이션 적용 중..."
if [ ! -f "init-db-v2.sql" ]; then
    echo "❌ 오류: init-db-v2.sql 파일을 찾을 수 없습니다."
    exit 1
fi

docker exec -i yj-dev-db psql -U ncafe -d ncafedb < init-db-v2.sql
if [ $? -eq 0 ]; then
    echo "✅ 스키마 마이그레이션 완료"
else
    echo "❌ 오류: 스키마 마이그레이션 실패"
    exit 1
fi
echo ""

# 4. 샘플 데이터 입력
echo "[4/4] 샘플 데이터 입력 중..."
if [ ! -f "data-v2.sql" ]; then
    echo "❌ 오류: data-v2.sql 파일을 찾을 수 없습니다."
    exit 1
fi

docker exec -i yj-dev-db psql -U ncafe -d ncafedb < data-v2.sql
if [ $? -eq 0 ]; then
    echo "✅ 샘플 데이터 입력 완료"
else
    echo "❌ 오류: 샘플 데이터 입력 실패"
    exit 1
fi
echo ""

# 5. 백엔드 재시작 (JPA가 엔티티 동기화)
echo "[추가] 백엔드 컨테이너 재시작 중..."
docker restart yj-dev-backend 2>/dev/null || {
    echo "⚠️  백엔드 컨테이너 재시작 실패 (수동으로 재시작하세요)"
}
echo ""

echo "========================================"
echo "✅ DB 마이그레이션 완료!"
echo "========================================"
echo ""
echo "📊 확인 방법:"
echo "  docker exec -it yj-dev-db psql -U ncafe -d ncafedb -c '\dt'"
echo ""
echo "📦 백업 파일: $BACKUP_FILE"
echo "   (문제 발생 시 복원 가능)"
echo ""
