FROM node:lts

WORKDIR /yambot
COPY ./ ./

RUN npm install
RUN npm run build

CMD [ "node", "." ]

