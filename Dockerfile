# Build stage - Using Alpine for building (smaller size)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
# Build with Netty native disabled
RUN mvn clean package -DskipTests -Dio.netty.noNative=true

# Final stage - Using Debian-based JRE (non-Alpine)
FROM eclipse-temurin:17-jre

ARG PROFILE=prod
ARG APP_VERSION=0.0.1-SNAPSHOT

WORKDIR /app
COPY --from=build /build/target/firm-*.jar app.jar

# Install curl for health check (using apt-get for Debian)
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=${PROFILE}
# Comprehensive Netty settings
ENV JAVA_TOOL_OPTIONS="\
    -Dio.netty.noNative=true \
    -Dio.netty.noUnsafe=true \
    -Dreactor.netty.http.client.enableHttp3=false \
    -Dreactor.netty.http.server.enableHttp3=false \
    -Dio.netty.tryReflectionSetAccessible=true \
    -Dio.netty.initialSeedUniquifier=1234567890 \
    -Djdk.nio.enableFastTcpLoopback=true \
    -Dio.netty.leakDetection.level=DISABLED \
    -XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Use exec form for better signal handling
ENTRYPOINT ["java", "-jar", "app.jar"]
