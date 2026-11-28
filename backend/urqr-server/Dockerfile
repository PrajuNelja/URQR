FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

COPY backend/urqr-server/pom.xml ./pom.xml
COPY backend/urqr-server/src ./src
RUN mvn --batch-mode --no-transfer-progress -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S urqr && adduser -S -G urqr urqr
COPY --from=build --chown=urqr:urqr /workspace/target/urqr-server-0.0.1-SNAPSHOT.jar /app/app.jar
USER urqr
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
