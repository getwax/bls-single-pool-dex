# This image is massive (> 2GB), find a way to slim down if needed again in future.
FROM node:16

WORKDIR /usr/src/app

COPY ./packages/react-app/package.json ./
RUN yarn --frozen-lockfile --only=production

COPY ./packages/react-app .

EXPOSE 8080
CMD [ "node", "./src/helpers/aggregatorProxy.mjs" ]
