FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=server/prisma/schema.prisma

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "run", "server"]
