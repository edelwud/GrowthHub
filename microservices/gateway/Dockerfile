FROM node:18-alpine
WORKDIR /microservice/gateway
RUN npm i -g pnpm
COPY package*.json .
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm run build
CMD ["node", "lib/main.js"]