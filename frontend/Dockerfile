FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Set default environment variable
ARG REACT_APP_API_URL=http://facemap.railway.internal:5000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the app
RUN echo "Building with API URL: $REACT_APP_API_URL" && \
    npm run build

# Production environment
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a proper entrypoint script
COPY <<-"EOF" /docker-entrypoint.sh
#!/bin/sh
if [ -n "$REACT_APP_API_URL" ]; then
  echo "window.ENV = { API_URL: \"$REACT_APP_API_URL\" };" > /usr/share/nginx/html/env-config.js
  echo "Runtime config injected: API_URL=$REACT_APP_API_URL"
else
  echo "window.ENV = { API_URL: \"http://facemap.railway.internal:5000\" };" > /usr/share/nginx/html/env-config.js
  echo "Using default API URL: http://facemap.railway.internal:5000"
fi
exec "$@"
EOF

RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Start nginx with our entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
