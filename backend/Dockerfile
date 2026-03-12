# Build stage
FROM gradle:8-jdk21-alpine AS build
WORKDIR /app
COPY . .
RUN set -eux; \
    for i in 1 2 3 4 5 6 7 8; do \
      gradle --no-daemon bootJar -x test && break; \
      if [ "$i" -eq 8 ]; then exit 1; fi; \
      echo "Gradle dependency download failed (attempt $i). Retrying..."; \
      sleep 15; \
    done

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
