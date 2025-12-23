# MeshCentral Docker Image for Render.com
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache bash tzdata wget

# Set timezone
ENV TZ=Asia/Tokyo

# Create app directory
WORKDIR /opt/meshcentral

# Create directories
RUN mkdir -p meshcentral-data meshcentral-files

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY start.js ./
COPY config.template.json ./config.template.json

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-10000}/ || exit 1

# Start MeshCentral
CMD ["node", "start.js"]
