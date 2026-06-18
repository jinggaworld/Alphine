# Alphine Backend — Node.js Express Server
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port (Railway sets PORT env)
EXPOSE 3001

# Start server
CMD ["node", "index.mjs"]
