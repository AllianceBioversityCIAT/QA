#################### BUILD STAGE ####################
FROM node:20.13.1-bookworm-slim AS build

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Force clean install to ensure optional dependencies (e.g., @rollup/rollup-linux-x64-gnu) are resolved for Linux
RUN rm -rf node_modules package-lock.json && \
    npm install --include=optional && \
    npm list @rollup/rollup-linux-x64-gnu || npm install --save-optional @rollup/rollup-linux-x64-gnu@4.22.4

# Verification step: confirm rollup Linux binary is available (remove after confirming fix works)
RUN node -e "require('@rollup/rollup-linux-x64-gnu'); console.log('✓ Rollup Linux x64 binary verified')" || \
    (echo "ERROR: Rollup Linux binary missing!" && exit 1)

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
