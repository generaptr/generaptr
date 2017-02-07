FROM node:7.3-slim
# Create app directory
RUN mkdir -p /usr/classroom/api
WORKDIR /usr/classroom/api

# Set environment vars
ENV APP_ENV development
ENV TZ Europe/Bucharest

ENV PORT 80

# Install app dependencies
COPY . /usr/classroom/api

RUN npm install

CMD [ "npm", "run", "-s", "start"]
