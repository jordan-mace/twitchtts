FROM node:slim AS builder

COPY package.json . 
COPY pnpm-lock.yaml .

RUN npm install
COPY tsconfig.json .
COPY index.html .
COPY vite.config.ts .
COPY /public ./public
COPY /src ./src

WORKDIR /build

RUN npm run build

FROM node:slim AS runner

RUN npm install --global serve

COPY --from=builder /build ./dist

EXPOSE 3000

ENTRYPOINT npx serve -s dist