FROM node:22-alpine
WORKDIR /app

# Copy the lockfile and install with `npm ci` so the image is reproducible and
# matches CI exactly. The previous `npm install` let the image drift.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# .dockerignore keeps .env*, node_modules and .next out of the build context.
# `COPY . .` previously baked .env.local (Razorpay secret, Telegram token,
# ADMIN_SECRET, CRON_SECRET, Qikink secret) into the image layer.
COPY . .
RUN npm run build
CMD ["npm","start"]
