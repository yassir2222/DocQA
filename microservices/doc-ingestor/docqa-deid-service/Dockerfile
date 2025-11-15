# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/docqa-deid-service-1.0-SNAPSHOT.jar /app/docqa-deid-service.jar

# Expose the application port
EXPOSE 8002

# Command to run the application
ENTRYPOINT ["java", "-jar", "docqa-deid-service.jar"]