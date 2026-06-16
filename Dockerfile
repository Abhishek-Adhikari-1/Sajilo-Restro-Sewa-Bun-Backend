FROM oven/bun:1 AS base

WORKDIR /app

# install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# copy full source
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "src/server.ts"]