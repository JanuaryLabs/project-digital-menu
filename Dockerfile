ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine as builder
LABEL fly_launch_runtime="NodeJS"
WORKDIR /app
ENV NODE_ENV=production
COPY ./output/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

FROM node:${NODE_VERSION}-alpine as runner
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY ./output/build/ /app/build/
COPY ./output/package*.json ./
CMD [ "npm", "start"]
EXPOSE 3000
