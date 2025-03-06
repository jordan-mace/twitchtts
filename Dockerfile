FROM node:slim

COPY package.json . 
COPY pnpm-lock.yaml .

RUN npm install
COPY tsconfig.json .
COPY /public ./public
COPY /src ./src

WORKDIR /build
EXPOSE 3000

ENTRYPOINT npm run build && npm run serve