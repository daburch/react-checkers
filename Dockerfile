FROM node:15.8.0-alpine3.10

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
RUN yarn install --production

COPY . .

CMD ["yarn", "start"]
