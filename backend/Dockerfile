FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
RUN npm install --workspace backend

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY package*.json ./
COPY backend ./backend
RUN npm run build --workspace backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json
WORKDIR /app/backend
EXPOSE 4000
CMD ["npm", "run", "start"]

