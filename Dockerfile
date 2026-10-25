FROM node:22-alpine AS build
# Build stage: install versions from package-lock.json and compile React/CSS.
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
# Serving stage: only the built static files and Nginx configuration are needed.
# Node and source dependencies stay in the earlier build stage.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
