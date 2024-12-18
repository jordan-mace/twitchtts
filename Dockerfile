FROM node:slim

COPY package.json . 
COPY package-lock.json .

RUN npm install
COPY tsconfig.json .
COPY webpack.config.ts .
COPY /public ./public
COPY /src ./src

EXPOSE 3000

ENTRYPOINT npm run build && npm run serve