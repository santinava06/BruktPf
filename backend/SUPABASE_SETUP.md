# 🗄️ Configuración Completa de Supabase - Brukt

## 📋 Pasos para Configurar Supabase

### **Paso 1: Crear Proyecto en Supabase**

1. **Ve a [supabase.com](https://supabase.com)**
2. **Haz clic en "Start your project"**
3. **Inicia sesión con GitHub o crea una cuenta**
4. **Crea un nuevo proyecto:**
   - **Name:** `brukt-finanzas`
   - **Database Password:** `tu-super-password-segura`
   - **Region:** Selecciona la más cercana (ej: US East)
   - **Pricing Plan:** Free tier (para empezar)

### **Paso 2: Obtener Credenciales de Conexión**

1. **Ve a Settings → Database**
2. **Copia la "Connection string"**
3. **Anota estas credenciales:**
   ```
   Host: db.xxxxxxxxxxxx.supabase.co
   Database: postgres
   Port: 5432
   User: postgres
   Password: tu-password-del-proyecto
   ```

### **Paso 3: Configurar Variables de Entorno**

En tu archivo `.env` del backend:

```env
# Supabase Database Configuration
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password-del-proyecto

# JWT Configuration
JWT_SECRET=tu-super-secret-key-muy-segura-y-unica
JWT_EXPIRES_IN=365d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:4173
```

### **Paso 4: Configurar SSL en Supabase**

En tu archivo `src/config/database.js`, asegúrate de que tenga esta configuración:

```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    // SSL configuration for Supabase
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);
```

### **Paso 5: Crear las Tablas en Supabase**

#### **Opción A: Usando SQL Editor**

Ve a **SQL Editor** en Supabase y ejecuta este script:

```sql
-- Crear tabla users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla expenses
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla groups
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla group_members
CREATE TABLE group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- Crear tabla group_expenses
CREATE TABLE group_expenses (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  expense_id INTEGER REFERENCES expenses(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  paid_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla invitations
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  inviter_id INTEGER REFERENCES users(id),
  invitee_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- Crear tabla debt_payments
CREATE TABLE debt_payments (
  id SERIAL PRIMARY KEY,
  payer_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimización
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_fecha ON expenses(fecha);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_expenses_group_id ON group_expenses(group_id);
CREATE INDEX idx_invitations_group_id ON invitations(group_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_debt_payments_payer_id ON debt_payments(payer_id);
CREATE INDEX idx_debt_payments_receiver_id ON debt_payments(receiver_id);
```

#### **Opción B: Usando Sequelize (Recomendado)**

Ejecuta tu aplicación backend y las tablas se crearán automáticamente:

```bash
cd backend
npm run db:sync
```

### **Paso 6: Configurar Row Level Security (RLS)**

En Supabase, ve a **Authentication → Policies** y configura las políticas:

#### **Para tabla `users`:**
```sql
-- Permitir a usuarios ver solo su propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Permitir a usuarios actualizar solo su propio perfil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### **Para tabla `expenses`:**
```sql
-- Permitir a usuarios ver solo sus propios gastos
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

-- Permitir a usuarios crear sus propios gastos
CREATE POLICY "Users can create own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir a usuarios actualizar sus propios gastos
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

-- Permitir a usuarios eliminar sus propios gastos
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);
```

### **Paso 7: Configurar Variables de Entorno para Render**

Cuando despliegues en Render, usa estas variables:

```env
# Supabase Database
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password-del-proyecto

# JWT Configuration
JWT_SECRET=tu-super-secret-key-muy-segura-y-unica
JWT_EXPIRES_IN=365d

# Server Configuration
PORT=10000
NODE_ENV=production

# CORS Configuration (actualizar con tu frontend)
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

### **Paso 8: Probar la Conexión**

Crea un script de prueba:

```javascript
// test-supabase-connection.js
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a Supabase exitosa!');
    
    // Probar una consulta simple
    const result = await sequelize.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:', result[0][0].version);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
```

Ejecuta:
```bash
node test-supabase-connection.js
```

### **Paso 9: Configurar Backups**

En Supabase:
1. Ve a **Settings → Database**
2. **Backups** están habilitados automáticamente
3. Los backups se realizan diariamente

### **Paso 10: Monitoreo y Logs**

En Supabase:
1. **Dashboard** - Ver estadísticas de uso
2. **Logs** - Ver queries y errores
3. **API** - Ver requests a la API

## 🔧 Configuración Avanzada

### **Connection Pooling**

Para optimizar las conexiones, configura en tu `database.js`:

```javascript
pool: {
  max: 10,        // Máximo de conexiones
  min: 2,         // Mínimo de conexiones
  acquire: 30000, // Tiempo máximo para adquirir conexión
  idle: 10000     // Tiempo máximo que una conexión puede estar inactiva
}
```

### **SSL Configuration**

Para producción, usa SSL estricto:

```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: true  // Cambiar a true en producción
  }
}
```

### **Environment Variables para Diferentes Entornos**

#### **Development (.env)**
```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password
NODE_ENV=development
```

#### **Production (Render)**
```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password
NODE_ENV=production
```

## 🚨 Troubleshooting

### **Error: "Connection refused"**
- Verifica que el host sea correcto
- Asegúrate de que el proyecto esté activo en Supabase
- Verifica las credenciales

### **Error: "SSL connection"**
- Asegúrate de que `rejectUnauthorized: false` esté configurado
- Verifica que el certificado SSL sea válido

### **Error: "Authentication failed"**
- Verifica usuario y contraseña
- Asegúrate de que el usuario tenga permisos

### **Error: "Database does not exist"**
- Verifica que `DB_NAME=postgres` (no cambiar)
- El nombre de la base de datos es siempre `postgres` en Supabase

## 📊 Monitoreo de Supabase

### **Dashboard**
- **Database Size:** Tamaño de la base de datos
- **Active Connections:** Conexiones activas
- **Query Performance:** Rendimiento de consultas

### **Logs**
- **Database Logs:** Errores de base de datos
- **API Logs:** Requests a la API
- **Auth Logs:** Eventos de autenticación

### **Alerts**
Configura alertas para:
- **High CPU Usage**
- **High Memory Usage**
- **Connection Limits**
- **Storage Limits**

## 🎯 Próximos Pasos

1. **Configura las variables de entorno**
2. **Ejecuta el script de sincronización**
3. **Prueba la conexión**
4. **Configura las políticas de seguridad**
5. **Despliega en Render con las credenciales**

¿Necesitas ayuda con algún paso específico de la configuración?
