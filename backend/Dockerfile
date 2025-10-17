FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Ensure env file is not required in container; Render will set env vars
ENV NODE_ENV=production

# Listen on the port provided by the environment
EXPOSE 3000

# Start the application using npm script defined in package.json
CMD ["npm", "start"]
