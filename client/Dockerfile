# install deps in their own layer so they get cached nicely
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# build the next app
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next bakes NEXT_PUBLIC_* at build time, so it has to come in here
# (comes from the build arg in docker-compose)
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# tells next.config.js to emit the standalone build (docker only, not vercel)
ENV DOCKER_BUILD=true

RUN npm run build

# final image - just runs the standalone build
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# copy over what the standalone output needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
