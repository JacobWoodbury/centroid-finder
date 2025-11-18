# 1. Start with an image that already has Java 21 (class file 65.0).
# This 'eclipse-temurin' image is based on Ubuntu 22.04 ("Jammy").
FROM eclipse-temurin:21-jre-jammy

# 2. Set the working directory
WORKDIR /app

# 3. --- Install System Dependencies ---
# We need:
#   - ffmpeg: (for your Node.js app)
#   - curl: (to download the Node.js setup script)
#   - nodejs: (to run npm)
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4. --- Install Node.js 18 ---
# We'll use the official NodeSource setup script.
# This ensures we get Node 18 and not the old one from the OS.
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# 5. --- Configure Node.js Server ---
# Copy package manifests first to cache the 'npm install' layer
COPY server/package*.json ./

# Install Node.js dependencies
RUN npm install

# 6. --- Copy Your Application Code ---
# Copy the rest of your server code and your Java .jar file
COPY . .

# 7. --- Expose and Run ---
# Expose the port your Node.js server listens on
EXPOSE 3000

# The command to run your server
CMD ["node", "server/src/server.js"]