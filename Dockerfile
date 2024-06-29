FROM node:slim

WORKDIR /xrpgl

RUN npm install -g bun@latest \
    && npm install create-next-app@latest \
    && npm install \
    && npm upgrade

EXPOSE 3000
