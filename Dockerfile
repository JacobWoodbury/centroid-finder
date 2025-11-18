
# This fixes the native library (SIGSEGV) crash
FROM eclipse-temurin:21-jre-jammy

# Install curl, which is needed to download the Node.js setup script
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# --- Add Node.js 18 ---
# This runs the official setup script from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
# Now install Node.js itself
RUN apt-get install -y nodejs
# --- End of Node.js setup ---


# Set the working directory inside the container
WORKDIR /app

RUN mkdir -p /app/server
WORKDIR /app/server

# Copy package.json and package-lock.json first
COPY server/package*.json /app/server/

RUN mkdir -p /app/processor/target
COPY processor/target/CentroidFinder-jar-with-dependencies.jar /app/processor/target

# Install project dependencies
RUN npm install

# Copy the rest of your server's code (src, public, etc.)
COPY /server /app/server/

# Your server.js listens on process.env.PORT.
EXPOSE 3000

# The command to run your server
CMD [ "npm", "run", "dev" ]