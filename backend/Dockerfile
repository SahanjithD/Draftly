## Backend Dockerfile (production)
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies for smaller image
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Environment and port
ENV NODE_ENV=production
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]