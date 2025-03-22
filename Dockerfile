FROM node:lts

WORKDIR /yambot
COPY ./ ./
RUN npm install && npm run build
CMD ["npm", "run", "start"]

