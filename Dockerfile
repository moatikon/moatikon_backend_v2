# 어떤 이미지를 사용할지
FROM node:alpine AS prod

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the Nest.js application
CMD ["npm", "run", "start"]