# ============================================
# Stage 1: Build Java JAR with Maven
# ============================================
# Use maven to build the jar file but don't keep the build files
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy pom.xml and source code
COPY processor/pom.xml ./
COPY processor/src ./src

# Build the JAR with dependencies
RUN mvn clean package -DskipTests

# ============================================
# Stage 2: Runtime Environment
# ============================================
# Use eclipse-temurin to run the jar file
FROM eclipse-temurin:21-jre-jammy

# Install Node.js 18 and build essentials for native modules
RUN apt-get update && \
    apt-get install -y curl python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Add Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
RUN mkdir -p /app/processor/target
COPY --from=builder /build/target/CentroidFinder-jar-with-dependencies.jar /app/processor/target/

# Set up Node.js server
RUN mkdir -p /app/server
WORKDIR /app/server

# Copy package files first (faster install if cache is used)
COPY server/package*.json ./

# Install dependencies and rebuild native modules for Linux
RUN npm install --build-from-source

# Copy server source code
COPY server/ ./

# Create directories for videos, results, and database (we should get videos and results when running docker image with -v option)
RUN mkdir -p /videos /results /app/data

# Set environment variables
ENV PORT=3000 \
    DB_PATH=/app/data/database.sqlite

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]