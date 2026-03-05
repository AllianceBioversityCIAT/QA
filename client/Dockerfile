#################### BUILD STAGE ####################
FROM node:20.13.1-bookworm-slim AS build

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# Build in dev mode as per team requirement
RUN npm run build

#################### TESTING STAGE ####################
FROM node:20.13.1-bookworm-slim AS test

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# Run tests (adjust the script if needed)
CMD ["npm", "run", "test:coverage"]

#################### PRODUCTION STAGE ####################
FROM nginx:alpine

# Clean default Nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app from build stage
COPY --from=build /usr/src/app/dist/browser /usr/share/nginx/html

# Permissions
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
