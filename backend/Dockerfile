FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package*.json ./
RUN npm install --omit=dev
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/dist ./dist
EXPOSE 3333
CMD ["node", "dist/server.js"]