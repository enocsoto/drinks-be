# Usa una imagen de Node.js para la etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copia todo el código fuente
COPY . .

RUN npm run build

# ---- Stage 2: Production ----
# Usa una imagen de Node.js más ligera para producción
FROM node:20-alpine

WORKDIR /usr/src/app

# Copia solo los artefactos necesarios de la etapa 'builder'
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# Expone el puerto en el que correrá la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]