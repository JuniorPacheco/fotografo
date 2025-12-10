# Use Node.js 20 LTS as base image (more secure)
FROM node:20-alpine AS base

# Update Alpine packages and install system dependencies required for Prisma and native modules
RUN apk update && apk upgrade && apk add --no-cache openssl libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy TypeScript config files
COPY tsconfig.json tsconfig.build.json ./

# Generate Prisma Client (DATABASE_URL dummy required by prisma.config.ts but not used for client generation)
RUN DATABASE_URL="postgresql://postgres:aitdBzbSYIZQUcsDlayAPFldtLzdSVCb@postgres.railway.internal:5432/railway" pnpm prisma:generate

# Copy source code (excluding node_modules via .dockerignore)
COPY src ./src

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Update Alpine packages and install system dependencies required for Prisma and native modules
RUN apk update && apk upgrade && apk add --no-cache openssl libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy generated Prisma Client from build stage
COPY --from=base /app/src/generated ./src/generated

# Copy built application
COPY --from=base /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"]

