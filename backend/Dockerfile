FROM node:20-alpine
WORKDIR /app

# Install shared dependencies (backend imports from shared via relative path)
COPY shared/package*.json ./shared/
WORKDIR /app/shared
RUN npm ci --omit=dev

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY shared/ /app/shared/
COPY backend/ /app/backend/

RUN mkdir -p /app/backend/uploads

EXPOSE 3001
CMD ["node", "src/server.js"]
