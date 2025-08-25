FROM node:lts
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY src ./src
COPY scripts ./scripts
COPY doc ./doc
COPY tsconfig.json ./
EXPOSE 5000
CMD ["sh", "-c", "npx ts-node -r tsconfig-paths/register scripts/create-root-user.ts && npm start"]