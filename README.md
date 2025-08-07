# Proyecto Final - Finanzas Compartidas

Este proyecto consiste en una aplicación web para gestionar finanzas con funcionalidades de grupos y gastos compartidos.

## Estructura del Proyecto

```
proyectoFinal/
├── backend/          # API REST con Express.js y SQLite
├── Brukt/           # Frontend con React y Vite
└── README.md        # Este archivo
```

## Configuración del Proyecto

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Backend

1. **Navegar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Crear archivo .env:**
   ```bash
   # Crear archivo .env en la carpeta backend con el siguiente contenido:
   PORT=3001
   JWT_SECRET=tu_super_secreto_jwt_aqui_cambialo_en_produccion
   NODE_ENV=development
   ```

4. **Ejecutar el servidor:**
   ```bash
   npm start
   # o para desarrollo con nodemon:
   npm run dev
   ```

El backend estará disponible en `http://localhost:3001`

### Frontend

1. **Navegar al directorio del frontend:**
   ```bash
   cd Brukt
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

El frontend estará disponible en `http://localhost:5173`

## Funcionalidades

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Gestión de tokens JWT

### Gestión de Gastos
- Crear, editar y eliminar gastos individuales
- Categorización de gastos
- Filtros y búsqueda

### Grupos de Gastos
- Crear grupos para gastos compartidos
- Invitar miembros a grupos
- Gestionar gastos dentro de grupos
- Ver estadísticas por grupo

### Reportes
- Visualización de gastos por categoría
- Estadísticas de gastos por período
- Análisis de gastos por usuario

## Tecnologías Utilizadas

### Backend
- **Express.js**: Framework web para Node.js
- **SQLite**: Base de datos ligera
- **JWT**: Autenticación con tokens
- **bcryptjs**: Encriptación de contraseñas
- **CORS**: Configuración para comunicación entre frontend y backend

### Frontend
- **React 19**: Biblioteca de interfaz de usuario
- **Vite**: Herramienta de construcción
- **React Router**: Navegación entre páginas
- **Material-UI**: Componentes de interfaz
- **Context API**: Gestión de estado global

## Estructura de la Base de Datos

### Tablas Principales
- `users`: Información de usuarios
- `expenses`: Gastos individuales
- `expense_groups`: Grupos de gastos
- `group_members`: Miembros de grupos
- `group_expenses`: Gastos de grupos
- `group_invitations`: Invitaciones a grupos

## Scripts Disponibles

### Backend
- `npm start`: Ejecutar servidor en producción
- `npm run dev`: Ejecutar servidor en desarrollo con nodemon

### Frontend
- `npm run dev`: Ejecutar servidor de desarrollo
- `npm run build`: Construir para producción
- `npm run lint`: Ejecutar linter
- `npm run preview`: Vista previa de la build

## Configuración de Desarrollo

### Variables de Entorno (.env)
```env
PORT=3001
JWT_SECRET=tu_super_secreto_jwt_aqui_cambialo_en_produccion
NODE_ENV=development
```

### CORS
El backend está configurado para aceptar peticiones desde:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (puerto alternativo)

## Notas Importantes

1. **Seguridad**: Cambia el JWT_SECRET en producción
2. **Base de datos**: SQLite se crea automáticamente en `backend/finanzas.db`
3. **Puertos**: Backend en 3001, Frontend en 5173
4. **Dependencias**: Asegúrate de instalar todas las dependencias en ambos directorios

## Solución de Problemas

### Error de CORS
- Verificar que el backend esté ejecutándose en el puerto 3001
- Verificar la configuración de CORS en `backend/src/app.js`

### Error de Base de Datos
- Verificar que el archivo `finanzas.db` existe en la carpeta backend
- Las tablas se crean automáticamente al iniciar el servidor

### Error de Dependencias
- Ejecutar `npm install` en ambos directorios
- Verificar que las versiones de Node.js sean compatibles 