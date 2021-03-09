FROM node:14.16.0 as build

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY tsconfig.json /app/tsconfig.json

RUN npm install -g webpack-cli
RUN npm install

COPY ./src/ ./src/

RUN npm run build