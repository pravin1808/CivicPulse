# Multi-stage build for Spring Boot with Java 21 (Alpine)

# Stage 1: Build the JAR
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Lightweight Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for container security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# JVM container memory tuning for Render free tier (512MB RAM)
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Xmx350m"

ENTRYPOINT ["java", "-jar", "app.jar"]
