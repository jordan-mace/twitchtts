FROM node:slim AS builder

ARG VITE_AWS_REGION
ARG VITE_AWS_ACCESS_KEY
ARG VITE_AWS_SECRET_KEY

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY package.json . 
COPY pnpm-lock.yaml .

RUN pnpm install

# Copy configuration files
COPY tsconfig.json .
COPY index.html .
COPY vite.config.ts .
COPY tailwind.config.js .
COPY postcss.config.js .

# Copy source files
COPY /public ./public
COPY /src ./src

RUN pnpm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html
