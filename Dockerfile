FROM node:slim

WORKDIR /xrpgl

RUN npm install -g bun \
    && npm install create-next-app \
    && npm install \
    && npm upgrade

EXPOSE 3000
