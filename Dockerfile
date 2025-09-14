FROM node:22-slim

WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation
COPY ["package.json", "package-lock.json*", "./"]

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Variables d'environnement
ENV MONGODB_URI="mongodb+srv://devJudicael:5dpJ2HsbuFmIrZjD@cluster0.oausy6s.mongodb.net/Studena?retryWrites=true&w=majority"
ENV PORT="3000"
ENV NODE_ENV="production"



# Exposer le port sur lequel l'app écoute
EXPOSE 3000

# Démarrer l'application
CMD ["node", "server.js"]