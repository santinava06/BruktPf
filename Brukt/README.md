# Brukt - Frontend 🌿

Sistema de gestión de gastos compartidos premium.

## 🚀 Despliegue en Producción

### Frontend (Vercel)
1. Conecta el repositorio a Vercel.
2. Configura las variables de entorno en el panel de Vercel:
   - `VITE_API_URL`: URL de tu backend en Render (ej: `https://tu-app.onrender.com/api`).
3. Vercel detectará automáticamente Vite y realizará el build.

### Backend (Render)
1. Conecta el repositorio del backend a Render.
2. Configura las variables de entorno necesarias (DB, Secretos, etc.).

## 🛠️ Desarrollo Local

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## ✨ Características Premium Aplicadas
- ✅ Transiciones fluidas con `framer-motion`.
- ✅ Interfaz con Glassmorphism y degradados.
- ✅ Lógica de servicios centralizada y segura.
