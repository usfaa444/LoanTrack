FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY packages/api/package.json packages/api/tsconfig.json ./packages/api/
COPY packages/database/prisma ./packages/database/prisma

RUN cd packages/api && npm install --legacy-peer-deps

COPY packages/api/src ./packages/api/src

RUN cd packages/api && node_modules/.bin/prisma generate --schema=../database/prisma/schema.prisma

EXPOSE 3001

CMD ["packages/api/node_modules/.bin/tsx", "watch", "packages/api/src/server.ts"]