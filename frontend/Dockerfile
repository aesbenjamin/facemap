FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Set environment variables with defaults
ARG BACKEND_URL=http://localhost:5000
ENV REACT_APP_API_URL=${BACKEND_URL}

# Build the app using railway script
RUN echo "Building with API URL: $REACT_APP_API_URL" && \
    npm run build

# Production environment
FROM nginx:alpine

# Install curl for healthcheck
RUN apk --no-cache add curl

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if you need specific routing for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 