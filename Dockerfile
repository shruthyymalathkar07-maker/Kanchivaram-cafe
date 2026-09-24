FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=server/prisma/schema.prisma

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npx", "tsx", "server/src/index.ts"]
