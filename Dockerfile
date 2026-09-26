# ----- Stage 1: Build -----
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for build
RUN npm install

# Copy source code
COPY . .

# Build NestJS application
RUN npm run build


# ----- Stage 2: Production -----
FROM node:20-alpine AS production

# Set production environment
ENV NODE_ENV=production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy build output
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]