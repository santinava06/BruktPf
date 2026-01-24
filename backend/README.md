# 🚀 Brukt Backend

API REST para la aplicación de finanzas Brukt.

## 📋 Características

- **Autenticación JWT**
- **Gestión de gastos individuales y grupales**
- **Sistema de grupos e invitaciones**
- **Análisis de deudas entre miembros**
- **Base de datos PostgreSQL con Sequelize**

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Sequelize** - ORM
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## 🚀 Despliegue

### Variables de Entorno Requeridas

```env
# Database
DB_HOST=tu-host-postgresql
DB_PORT=5432
DB_NAME=tu-nombre-database
DB_USER=tu-usuario
DB_PASSWORD=tu-password

# JWT
JWT_SECRET=tu-super-secret-key
JWT_EXPIRES_IN=365d

# Server
PORT=10000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

### Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm start

# Sincronizar base de datos
npm run db:sync
```

## 📊 Endpoints

### Health Check
- `GET /api/health` - Estado del servidor
- `GET /api/ping` - Ping simple

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil del usuario

### Gastos
- `GET /api/expenses` - Listar gastos
- `POST /api/expenses` - Crear gasto
- `DELETE /api/expenses/:id` - Eliminar gasto

### Grupos
- `GET /api/groups` - Listar grupos
- `POST /api/groups` - Crear grupo
- `GET /api/groups/:id` - Detalles del grupo

## 📁 Estructura

```
src/
├── config/          # Configuración de DB
├── controllers/     # Controladores
├── middlewares/     # Middlewares
├── models/          # Modelos de datos
├── routes/          # Rutas de la API
├── services/        # Lógica de negocio
└── utils/           # Utilidades
```

## 🔧 Desarrollo Local

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura variables de entorno en `.env`
4. Ejecuta: `npm run dev`

## 📚 Documentación

Ver `DEPLOYMENT.md` para guía completa de despliegue en Render. 