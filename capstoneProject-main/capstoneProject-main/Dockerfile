FROM node:20.12.1-alpine AS base

WORKDIR /app

RUN apk add git

FROM base AS build

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
 && corepack prepare pnpm@8.14.1 --activate \
 && pnpm install --frozen-lockfile

COPY . .

ARG API_URL
ENV VITE_API_BASE_URL=$API_URL
RUN pnpm build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]