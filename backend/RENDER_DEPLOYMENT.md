# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar el backend de Brukt en Render.com.

## 📋 Prerrequisitos

1. Cuenta en [Render.com](https://render.com)
2. Base de datos PostgreSQL (puedes crear una en Render o usar una externa)
3. Repositorio Git con tu código

## 🔧 Configuración en Render

### 1. Crear un Nuevo Web Service

1. Ve a tu dashboard de Render
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio Git
4. Configura el servicio:
   - **Name**: `brukt-backend` (o el nombre que prefieras)
   - **Environment**: `Node`
   - **Build Command**: `npm install` (o déjalo vacío, Render lo detecta automáticamente)
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` (importante: especifica la carpeta del backend)

### 2. Configurar Variables de Entorno

En la sección "Environment" del servicio, agrega las siguientes variables:

#### Variables Requeridas

```env
# Base de Datos
# Opción 1: Si usas INTERNAL_DATABASE_URL (RECOMENDADO para Render - más confiable)
INTERNAL_DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db

# Opción 2: Si usas DATABASE_URL (alternativa)
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db

# Opción 3: Si usas variables individuales
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=tu-nombre-database
DB_USER=tu-usuario
DB_PASSWORD=tu-password

# JWT (OBLIGATORIO - genera uno seguro)
JWT_SECRET=tu-super-secret-key-muy-largo-y-seguro-aqui
JWT_EXPIRES_IN=365d

# Servidor
PORT=10000
NODE_ENV=production

# CORS (reemplaza con tu URL de frontend)
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-frontend.netlify.app
```

#### Notas Importantes:

- **DATABASE_URL**: Si creas una base de datos PostgreSQL en Render, Render automáticamente crea la variable `DATABASE_URL`. Puedes usar esta variable directamente.
- **JWT_SECRET**: **NUNCA** uses el valor por defecto en producción. Genera uno seguro con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **ALLOWED_ORIGINS**: Agrega todas las URLs desde donde se harán requests (frontend, dominios de producción, etc.)

### 3. Configurar Health Check (Opcional pero Recomendado)

En la sección "Health Check Path" del servicio:
- **Health Check Path**: `/api/health` o `/api/ping`

Esto permite que Render verifique automáticamente si tu servicio está funcionando.

### 4. Configuración de Base de Datos

#### Opción A: Base de Datos PostgreSQL en Render

1. Ve a "New +" → "PostgreSQL"
2. Configura la base de datos:
   - **Name**: `brukt-db`
   - **Database**: `brukt_db` (o el nombre que prefieras)
   - **User**: Se genera automáticamente
   - **Region**: Elige la región más cercana a tus usuarios
3. Una vez creada, Render proporciona automáticamente la variable `DATABASE_URL`
4. Conecta la base de datos a tu web service:
   - En tu web service, ve a "Connections"
   - Agrega la base de datos PostgreSQL

#### Opción B: Base de Datos Externa

Si usas una base de datos externa (Supabase, AWS RDS, etc.):
- Configura las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- O usa `DATABASE_URL` con el formato: `postgresql://usuario:password@host:puerto/database`

### 5. Sincronizar la Base de Datos

Después del primer despliegue, necesitas sincronizar las tablas. Tienes dos opciones:

#### Opción 1: Usar DB_SYNC (Solo para el primer despliegue)

Agrega temporalmente esta variable de entorno:
```env
DB_SYNC=true
```

Esto creará las tablas automáticamente. **IMPORTANTE**: Después de que las tablas se creen, **elimina esta variable** para evitar problemas en futuros despliegues.

#### Opción 2: Ejecutar manualmente (Recomendado)

1. Una vez que el servicio esté desplegado, ejecuta:
   ```bash
   npm run db:sync
   ```
   Esto sincronizará las tablas en la base de datos.

## 🔍 Verificación del Despliegue

### 1. Verificar que el Servicio Está Activo

Visita: `https://tu-servicio.onrender.com/api/ping`

Deberías ver:
```json
{
  "message": "pong",
  "timestamp": "..."
}
```

### 2. Verificar Health Check

Visita: `https://tu-servicio.onrender.com/api/health`

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production",
  "database": "connected",
  "version": "1.0.0"
}
```

### 3. Verificar Conexión a la Base de Datos

Si el health check muestra `"database": "connected"`, la conexión está funcionando correctamente.

## 🐛 Solución de Problemas Comunes

### Error: "SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing"

**Causa:** Problema de autenticación SSL/TLS con PostgreSQL en Render.

**Soluciones:**
1. **Usar INTERNAL_DATABASE_URL**: Render proporciona una URL interna que es más confiable. En lugar de `DATABASE_URL`, usa `INTERNAL_DATABASE_URL`:
   - Ve a tu base de datos PostgreSQL en Render
   - Copia la "Internal Database URL" 
   - Agrega como variable de entorno: `INTERNAL_DATABASE_URL` (tiene prioridad sobre `DATABASE_URL`)

2. **Verificar la versión de Node.js**: El código está configurado para Node.js >= 18.0.0. Render usa Node.js 22 por defecto, lo cual es compatible.

3. **Verificar que la base de datos esté activa**: Asegúrate de que la base de datos PostgreSQL esté en estado "Available" en Render.

4. **Revisar las credenciales**: Verifica que la URL de conexión sea correcta y no esté corrupta.

### Error: "Cannot connect to database"

**Causas posibles:**
1. Variables de entorno no configuradas correctamente
2. Base de datos no está activa
3. Credenciales incorrectas
4. Firewall bloqueando la conexión

**Soluciones:**
- Verifica que todas las variables de entorno estén configuradas
- Si usas `DATABASE_URL`, verifica que el formato sea correcto
- **Recomendado**: Usa `INTERNAL_DATABASE_URL` en lugar de `DATABASE_URL` para mejor compatibilidad
- Verifica que la base de datos esté activa en Render
- Revisa los logs del servicio para más detalles

### Error: "Port already in use" o "EADDRINUSE"

**Causa:** El servidor no está escuchando en la interfaz correcta.

**Solución:** Ya está corregido en el código. El servidor ahora escucha en `0.0.0.0` en lugar de solo `localhost`.

### Error: "CORS policy"

**Causa:** El frontend no está en la lista de origins permitidos.

**Solución:** Agrega la URL de tu frontend a la variable `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://tu-frontend.netlify.app
```

### El servicio se reinicia constantemente

**Causas posibles:**
1. Error en el código que causa que el proceso se cierre
2. Health check fallando
3. Problemas de memoria

**Soluciones:**
- Revisa los logs del servicio en Render
- Verifica que el health check esté funcionando
- Aumenta el plan si es necesario (Render Free tiene limitaciones)

### Las tablas no se crean

**Causa:** `DB_SYNC` no está habilitado o la sincronización falló.

**Soluciones:**
1. Agrega temporalmente `DB_SYNC=true` (solo para el primer despliegue)
2. O ejecuta manualmente: `npm run db:sync` desde tu máquina local apuntando a la base de datos de producción

## 📝 Checklist de Despliegue

- [ ] Servicio web creado en Render
- [ ] Root directory configurado como `backend`
- [ ] Variables de entorno configuradas:
  - [ ] `DATABASE_URL` o variables de DB individuales
  - [ ] `JWT_SECRET` (generado de forma segura)
  - [ ] `NODE_ENV=production`
  - [ ] `ALLOWED_ORIGINS` con URLs del frontend
- [ ] Base de datos PostgreSQL creada y conectada
- [ ] Health check path configurado (`/api/health` o `/api/ping`)
- [ ] Servicio desplegado y activo
- [ ] Health check respondiendo correctamente
- [ ] Base de datos sincronizada (tablas creadas)
- [ ] Frontend configurado para apuntar a la URL de Render

## 🔐 Seguridad

- ✅ **NUNCA** commits archivos `.env` al repositorio
- ✅ Usa `JWT_SECRET` fuerte y único
- ✅ Configura `ALLOWED_ORIGINS` correctamente
- ✅ Usa HTTPS (Render lo proporciona automáticamente)
- ✅ Mantén `NODE_ENV=production` en producción

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Node.js en Render](https://render.com/docs/node)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servicio en Render
2. Verifica las variables de entorno
3. Prueba el health check endpoint
4. Revisa la documentación de Render

