FROM node:hydrogen-alpine AS base
WORKDIR "/usr/app"
COPY package*.json ./
RUN npm i

FROM node:hydrogen-alpine AS builder
WORKDIR "/usr/app"
COPY --from=base "/usr/app/node_modules" "./node_modules"
COPY src ./src
COPY tsconfig.json ./
COPY package*.json ./
RUN npm run build

FROM node:hydrogen-alpine AS runner
WORKDIR "/usr/app"
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder "/usr/app/dist" "./dist"
CMD [ "npm","run", "start" ]