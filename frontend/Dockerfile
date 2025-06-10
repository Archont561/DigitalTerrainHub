FROM node:lts AS dev

WORKDIR /app

COPY package.json package-lock.json* /app/

RUN npm install

COPY . /app/

EXPOSE 4321

CMD ["sh", "-c", "${DOCKER_CMD:-npm run start}"]