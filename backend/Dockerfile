# 빌드 시 네트워크 타임아웃 문제를 방지하기 위해 
# 호스트에서 빌드된 JAR 파일을 직접 사용하여 이미지를 생성합니다.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 로컬 빌드 결과물(build/libs/backend-0.0.1-SNAPSHOT.jar)을 컨테이너로 복사
COPY build/libs/backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
