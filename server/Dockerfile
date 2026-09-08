# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev deps needed to compile TypeScript)
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript -> dist
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS from the build stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]
