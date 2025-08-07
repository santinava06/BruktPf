# 🏗️ Arquitectura del Sistema Brukt

## 📊 Diagrama de Flujo: Frontend ↔ Backend ↔ Base de Datos

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Login/Register│  │    Dashboard    │  │     Groups      │  │ GroupDetails│ │
│  │                 │  │                 │  │                 │  │             │ │
│  │ • Auth Forms    │  │ • Expense Stats │  │ • Group List    │  │ • Expenses  │ │
│  │ • JWT Storage   │  │ • Expense Table │  │ • Create Group  │  │ • Members   │ │
│  │ • Route Guard   │  │ • Add Expense   │  │ • Invitations   │  │ • Debts     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS Requests
                      │ (REST API)
                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Node.js + Express)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Middlewares   │  │   Controllers   │  │     Services    │  │   Routes    │ │
│  │                 │  │                 │  │                 │  │             │ │
│  │ • CORS          │  │ • Auth Ctrl     │  │ • Auth Service  │  │ • /api/auth │ │
│  │ • JWT Verify    │  │ • Expense Ctrl  │  │ • Expense Svc   │  │ • /api/exp  │ │
│  │ • Error Handler │  │ • Group Ctrl    │  │ • Group Service │  │ • /api/groups│ │
│  │ • Body Parser   │  │ • Debt Ctrl     │  │ • Debt Service  │  │ • /api/debt │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────┬───────────────────────────────────────────────────────────┘
                      │
                      │ Sequelize ORM
                      │ (SQL Queries)
                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BASE DE DATOS (PostgreSQL)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     users       │  │    expenses     │  │     groups      │  │group_members│ │
│  │                 │  │                 │  │                 │  │             │ │
│  │ • id (PK)       │  │ • id (PK)       │  │ • id (PK)       │  │ • id (PK)   │ │
│  │ • nombre        │  │ • descripcion   │  │ • nombre        │  │ • user_id   │ │
│  │ • email (UNIQUE)│  │ • monto         │  │ • descripcion   │  │ • group_id  │ │
│  │ • password_hash │  │ • categoria     │  │ • created_by    │  │ • role       │ │
│  │ • created_at    │  │ • fecha         │  │ • created_at    │  │ • joined_at  │ │
│  │ • updated_at    │  │ • user_id (FK)  │  │ • updated_at    │  │ • status     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ group_expenses  │  │ debt_payments   │  │  invitations    │                  │
│  │                 │  │                 │  │                 │                  │
│  │ • id (PK)       │  │ • id (PK)       │  │ • id (PK)       │                  │
│  │ • group_id (FK) │  │ • payer_id (FK) │  │ • group_id (FK) │                  │
│  │ • expense_id(FK)│  │ • receiver_id(FK)│  │ • inviter_id(FK)│                  │
│  │ • amount        │  │ • amount        │  │ • invitee_email │                  │
│  │ • description   │  │ • description   │  │ • status        │                  │
│  │ • paid_by_id    │  │ • date          │  │ • created_at    │                  │
│  │ • created_at    │  │ • created_at    │  │ • expires_at    │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos Detallado

### **1. Autenticación**
```
Frontend → POST /api/auth/login → Backend → JWT Verify → Database → User Data → JWT Token → Frontend
```

### **2. Gestión de Gastos**
```
Frontend → POST /api/expenses → Backend → Validation → Database → Expense Created → Response → Frontend
Frontend → GET /api/expenses → Backend → Database Query → Expense List → Frontend
```

### **3. Gestión de Grupos**
```
Frontend → POST /api/groups → Backend → Validation → Database → Group Created → Response → Frontend
Frontend → GET /api/groups/:id → Backend → Database Query → Group Details → Frontend
```

### **4. Análisis de Deudas**
```
Frontend → GET /api/groups/:id/debts → Backend → Complex Query → Database → Debt Analysis → Frontend
```

## 🛡️ Capas de Seguridad

### **Frontend**
- **Route Guards:** Protección de rutas privadas
- **JWT Storage:** Almacenamiento seguro de tokens
- **Input Validation:** Validación de formularios

### **Backend**
- **CORS:** Control de acceso cross-origin
- **JWT Middleware:** Verificación de tokens
- **Input Sanitization:** Limpieza de datos
- **Error Handling:** Manejo de errores centralizado

### **Base de Datos**
- **Password Hashing:** Contraseñas encriptadas
- **Foreign Keys:** Integridad referencial
- **Indexes:** Optimización de consultas
- **SSL Connection:** Conexión segura

## 📡 Endpoints Principales

### **Autenticación**
```
POST /api/auth/register    # Registro de usuario
POST /api/auth/login       # Login de usuario
GET  /api/auth/profile     # Perfil del usuario
```

### **Gastos**
```
GET    /api/expenses       # Listar gastos
POST   /api/expenses       # Crear gasto
DELETE /api/expenses/:id   # Eliminar gasto
```

### **Grupos**
```
GET    /api/groups         # Listar grupos
POST   /api/groups         # Crear grupo
GET    /api/groups/:id     # Detalles del grupo
POST   /api/groups/:id/expenses # Agregar gasto al grupo
```

### **Invitaciones**
```
GET    /api/invitations    # Listar invitaciones
POST   /api/invitations    # Enviar invitación
PUT    /api/invitations/:id/accept # Aceptar invitación
```

### **Pagos de Deudas**
```
GET    /api/debt-payments  # Listar pagos
POST   /api/debt-payments  # Registrar pago
```

## 🔧 Tecnologías por Capa

### **Frontend (Vercel)**
- **React 18** - Framework de UI
- **Vite** - Build tool
- **Material-UI** - Componentes UI
- **React Router** - Navegación
- **Axios** - HTTP client

### **Backend (Render)**
- **Node.js** - Runtime
- **Express.js** - Framework web
- **Sequelize** - ORM
- **JWT** - Autenticación
- **bcryptjs** - Encriptación
- **CORS** - Cross-origin

### **Base de Datos (Supabase)**
- **PostgreSQL** - Base de datos
- **SSL** - Conexión segura
- **Connection Pooling** - Optimización
- **Backups** - Respaldo automático

## 🚀 Flujo de Despliegue

```
1. Frontend (Vercel) ←→ Backend (Render) ←→ Database (Supabase)
2. HTTPS/SSL en todas las conexiones
3. Variables de entorno configuradas
4. CORS configurado para dominios específicos
5. Health checks para monitoreo
```

## 📊 Monitoreo y Logs

### **Frontend**
- Console logs para debugging
- Error boundaries para captura de errores
- Performance monitoring

### **Backend**
- Request/Response logging
- Error tracking
- Database query monitoring
- Health check endpoints

### **Base de Datos**
- Query performance
- Connection monitoring
- Backup verification
