FROM node:20-alpine AS builder
WORKDIR /app

# Install shared dependencies (frontend imports from shared via @shared alias)
COPY shared/package*.json ./shared/
WORKDIR /app/shared
RUN npm ci --omit=dev

# Install frontend dependencies
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copy source files
COPY shared/ /app/shared/
COPY frontend/ /app/frontend/

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
