FROM node:lts

RUN apt-get update && apt-get install -y --no-install-recommends \
    libavahi-compat-libdnssd-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g homebridge homebridge-config-ui-x

WORKDIR /workspace

COPY .devcontainer/config.json /var/lib/homebridge/config.json
COPY .devcontainer/startup.json /var/lib/homebridge/.uix-hb-service-homebridge-startup.json

COPY package*.json tsconfig.json nodemon.json config.schema.json ./
COPY src ./src
RUN npm ci --include=dev && npm run build && npm link

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
