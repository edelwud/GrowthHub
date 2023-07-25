FROM node:18-alpine
LABEL org.opencontainers.image.source=https://github.com/edelwud/GrowthHub
WORKDIR /microservice/staff
RUN npm i -g pnpm
COPY package*.json .
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm run build
CMD ["node", "lib/main.js"]