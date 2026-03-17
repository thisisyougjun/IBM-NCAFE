# Build stage
FROM gradle:8-jdk25-alpine AS build
WORKDIR /app
COPY . .
RUN gradle bootJar -x test

# Run stage
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
