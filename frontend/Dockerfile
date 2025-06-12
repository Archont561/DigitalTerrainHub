# === Builder Stage ===
FROM oven/bun:slim AS builder

WORKDIR /app

COPY bun.lock package.json ./

RUN bun install

COPY . .

RUN bun run build


# === Production Stage ===
FROM oven/bun:slim AS prod

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

RUN bun install --production

EXPOSE 4321

CMD ["sh", "-c", "${DOCKER_CMD:-bun run start}"]
