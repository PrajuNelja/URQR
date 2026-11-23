# =============================================================================
# URQR Server — Multi-stage Dockerfile
# Nelja Tech | Phase 1 | Spring Boot Modular Monolith
#
# Base image: eclipse-temurin:21-jre-alpine (minimal JRE, no JDK in runtime)
#
# Stages:
#   1. builder  — JDK 21 + Maven wrapper — compiles the fat JAR
#   2. runtime  — eclipse-temurin:21-jre-alpine — runs only the JAR
#
# Build:
#   docker build -t urqr-server:latest .
#
# Run:
#   docker run --env-file ../../.env -p 8081:8081 urqr-server:latest
# =============================================================================

# ── Stage 1: BUILD ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /workspace

# Copy Maven wrapper and POM first (layer-cached unless deps change)
COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml pom.xml

# Make mvnw executable and download dependencies (cached layer)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -q

# Copy source
COPY src src

# Build — skip tests here; tests run in CI (backend-test job)
RUN ./mvnw package -B -DskipTests -q

# Extract Spring Boot layered JAR for optimal Docker layer caching
RUN java -Djarmode=layertools \
    -jar target/urqr-server-*.jar \
    extract --destination /workspace/extracted

# ── Stage 2: RUNTIME ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Security: run as non-root user
RUN addgroup -S urqr && adduser -S urqr -G urqr

WORKDIR /app

# Copy Spring Boot layers in dependency-stability order
# (least-volatile layers first = better cache reuse on re-build)
COPY --from=builder --chown=urqr:urqr /workspace/extracted/dependencies          ./
COPY --from=builder --chown=urqr:urqr /workspace/extracted/spring-boot-loader    ./
COPY --from=builder --chown=urqr:urqr /workspace/extracted/snapshot-dependencies ./
COPY --from=builder --chown=urqr:urqr /workspace/extracted/application           ./

USER urqr

# App port (matches API_PORT in .env)
EXPOSE 8081

# JVM tuning for containers:
#   -XX:+UseContainerSupport      — respect Docker CPU/mem limits
#   -XX:MaxRAMPercentage=75.0     — use 75% of container RAM for heap
#   -XX:+ExitOnOutOfMemoryError   — crash fast on OOM instead of hanging
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -XX:+ExitOnOutOfMemoryError \
               -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
