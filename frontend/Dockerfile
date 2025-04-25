FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Set environment variables with defaults
ARG BACKEND_URL=https://facemap
ENV REACT_APP_API_URL=${BACKEND_URL}

# Build the app
RUN echo "Building with API URL: $REACT_APP_API_URL" && \
    npm run build

# Production environment
FROM nginx:alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create a more robust nginx config with IPv6 support
RUN echo 'server { \
    listen 80 default_server; \
    listen [::]:80 default_server; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "ok"; \
    } \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ { \
        root /usr/share/nginx/html; \
        expires 30d; \
        add_header Cache-Control "public, no-transform"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Add healthcheck


# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
