FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew bootJar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# buildDir is set to /tmp/gradle-build in build.gradle
COPY --from=build /tmp/gradle-build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
