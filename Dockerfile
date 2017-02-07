FROM node:7.2-slim
# Create app directory
RUN mkdir -p /usr/generaptr
WORKDIR /usr/generaptr

# Set environment vars
ENV APP_ENV development

ENV PORT 80

# Install app dependencies
COPY . /usr/generaptr

RUN npm install

CMD [ "npm", "run", "-s", "start"]
