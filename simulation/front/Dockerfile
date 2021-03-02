FROM node:14.16.0 as build

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY ./front .

RUN npm build