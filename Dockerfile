FROM node:16.10.0-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN yarn install
COPY . ./
RUN yarn build
CMD ["yarn", "start"]