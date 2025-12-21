# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Build l'application avec CI=false pour ignorer les warnings ESLint
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Build l'application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
