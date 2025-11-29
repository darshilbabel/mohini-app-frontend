FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build the React application
# Actual env vars will be injected at runtime via env-config.js
RUN npx react-scripts build

FROM nginx:alpine

# Install bash for the env generation script
RUN apk add --no-cache bash

COPY --from=build /app/build /usr/share/nginx/html/mohini
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy scripts directory to have access to the env generation script
COPY --from=build /app/scripts /scripts

# Create wrapper script that calls our env generation script with correct path
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-generate-env.sh && \
    echo '/scripts/generate-env-config.sh /usr/share/nginx/html/mohini/env-config.js' >> /docker-entrypoint.d/40-generate-env.sh && \
    chmod +x /docker-entrypoint.d/40-generate-env.sh && \
    chmod +x /scripts/generate-env-config.sh

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]