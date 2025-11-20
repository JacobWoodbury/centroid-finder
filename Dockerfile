
# lets our java app run 
FROM eclipse-temurin:21-jre-jammy

# install curl, so that we can add node
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

#set up the server folder
RUN mkdir -p /app/server
WORKDIR /app/server

# Copy package.json and package-lock.json first so that it only re runs npm i if packages change
COPY server/package*.json /app/server/

#make a target folder for the jar (we don't need the rest of processor I believe)
RUN mkdir -p /app/processor/target
COPY processor/target/CentroidFinder-jar-with-dependencies.jar /app/processor/target

RUN npm install

#copy the rest of the server
COPY /server /app/server/

EXPOSE 3000

CMD [ "npm", "run", "dev" ]