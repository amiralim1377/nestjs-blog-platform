# ----- Stage 1: Build -----
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies for build
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build NestJS application
RUN npm run build


# ----- Stage 2: Production -----
FROM node:22-alpine AS production

# Set production environment
ENV NODE_ENV=production
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN apk add --no-cache python3 make g++ \
    && npm pkg delete scripts.prepare \
    && npm install --omit=dev --legacy-peer-deps \
    && apk del python3 make g++

# Copy build output
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]