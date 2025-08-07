# 🚀 Guía de Despliegue en Render

## 📋 Requisitos Previos

1. **Cuenta en Render.com**
2. **Base de datos PostgreSQL** (puedes usar Supabase, Railway, o Render PostgreSQL)
3. **Código del backend en un repositorio Git**

## 🔧 Configuración para Render

### 1. Variables de Entorno Requeridas

Configura estas variables en Render:

```env
# Database Configuration
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=tu-nombre-database
DB_USER=tu-usuario
DB_PASSWORD=tu-password

# JWT Configuration
JWT_SECRET=tu-super-secret-key-muy-segura
JWT_EXPIRES_IN=365d

# Server Configuration
PORT=10000
NODE_ENV=production

# CORS Configuration
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-dominio.com
```

### 2. Configuración de Render

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Node.js

### 3. Base de Datos

**Opción A: Supabase (Recomendado)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > Database
4. Copia la connection string
5. Configura las variables de entorno en Render

**Opción B: Render PostgreSQL**
1. En Render, crea un nuevo PostgreSQL service
2. Usa las credenciales automáticamente generadas

## 🛠️ Pasos de Despliegue

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub/GitLab
2. Verifica que el `package.json` tenga el script `start`
3. Verifica que el `Procfile` esté presente

### Paso 2: Crear Web Service en Render

1. Ve a [render.com](https://render.com)
2. Haz clic en "New +"
3. Selecciona "Web Service"
4. Conecta tu repositorio Git
5. Configura:
   - **Name:** `finanzas-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Paso 3: Configurar Variables de Entorno

En la sección "Environment" de tu servicio:

```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password-supabase
JWT_SECRET=tu-super-secret-key-muy-segura
JWT_EXPIRES_IN=365d
PORT=10000
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

### Paso 4: Desplegar

1. Haz clic en "Create Web Service"
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará dependencias
   - Ejecutará el build
   - Iniciará el servidor

### Paso 5: Verificar Despliegue

1. Ve a la URL generada por Render
2. Deberías ver: "API Finanzas Familiares - PostgreSQL"
3. Prueba: `https://tu-app.onrender.com/api/health`

## 🔍 Troubleshooting

### Error: "Cannot connect to database"
- Verifica las credenciales de la base de datos
- Asegúrate de que la base de datos esté activa
- Verifica que el host sea accesible desde Render

### Error: "CORS error"
- Verifica que `ALLOWED_ORIGINS` incluya tu frontend
- Asegúrate de que el protocolo sea `https://`

### Error: "JWT_SECRET not set"
- Asegúrate de configurar `JWT_SECRET` en las variables de entorno

## 📊 Monitoreo

- **Logs:** Disponibles en la pestaña "Logs" de Render
- **Metrics:** CPU, memoria y requests en tiempo real
- **Health Checks:** Configura endpoints de health check

## 🔄 Actualizaciones

Para actualizar:
1. Haz push a tu repositorio
2. Render automáticamente redeployará
3. Los logs mostrarán el progreso

## 🚨 Notas Importantes

- **Free Tier:** Render tiene limitaciones en el plan gratuito
- **Sleep Mode:** El servicio puede "dormir" después de 15 minutos de inactividad
- **SSL:** Render proporciona SSL automáticamente
- **Custom Domain:** Puedes configurar un dominio personalizado
