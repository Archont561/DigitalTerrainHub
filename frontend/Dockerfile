FROM oven/bun:slim AS dev

WORKDIR /app

COPY bun.lock package.json /app/

RUN bun install

COPY . /app/

EXPOSE 4321

CMD ["sh", "-c", "${DOCKER_CMD:-bun run start}"]
