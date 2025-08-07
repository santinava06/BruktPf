# 🗄️ Esquema de Base de Datos - Brukt

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ESQUEMA DE BASE DE DATOS                         │
│                                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐                    │
│  │     users       │                    │    expenses     │                    │
│  │                 │                    │                 │                    │
│  │ • id (PK)       │◀───────────────────│ • user_id (FK)  │                    │
│  │ • nombre        │                    │ • descripcion   │                    │
│  │ • email (UNIQUE)│                    │ • monto         │                    │
│  │ • password_hash │                    │ • categoria     │                    │
│  │ • created_at    │                    │ • fecha         │                    │
│  │ • updated_at    │                    │ • created_at    │                    │
│  └─────────────────┘                    │ • updated_at    │                    │
│                                         └─────────────────┘                    │
│                                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐                    │
│  │     groups      │                    │ group_members   │                    │
│  │                 │                    │                 │                    │
│  │ • id (PK)       │◀───────────────────│ • group_id (FK) │                    │
│  │ • nombre        │                    │ • user_id (FK)  │                    │
│  │ • descripcion   │                    │ • role          │                    │
│  │ • created_by    │                    │ • joined_at     │                    │
│  │ • created_at    │                    │ • status        │                    │
│  │ • updated_at    │                    │ • created_at    │                    │
│  └─────────────────┘                    │ • updated_at    │                    │
│         ▲                               └─────────────────┘                    │
│         │                                        ▲                             │
│         │                                        │                             │
│         │                                        │                             │
│  ┌─────────────────┐                    ┌─────────────────┐                    │
│  │ group_expenses  │                    │  invitations    │                    │
│  │                 │                    │                 │                    │
│  │ • id (PK)       │                    │ • id (PK)       │                    │
│  │ • group_id (FK) │                    │ • group_id (FK) │                    │
│  │ • expense_id(FK)│                    │ • inviter_id(FK)│                    │
│  │ • amount        │                    │ • invitee_email │                    │
│  │ • description   │                    │ • status        │                    │
│  │ • paid_by_id    │                    │ • created_at    │                    │
│  │ • created_at    │                    │ • expires_at    │                    │
│  └─────────────────┘                    └─────────────────┘                    │
│                                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐                    │
│  │ debt_payments   │                    │   (Relaciones)  │                    │
│  │                 │                    │                 │                    │
│  │ • id (PK)       │                    │ users ◄──► groups                   │
│  │ • payer_id (FK) │                    │ groups ◄──► expenses                │
│  │ • receiver_id(FK)│                   │ users ◄──► invitations              │
│  │ • amount        │                    │ users ◄──► debt_payments            │
│  │ • description   │                    │ groups ◄──► group_expenses          │
│  │ • date          │                    │                 │                    │
│  │ • created_at    │                    │                 │                    │
│  └─────────────────┘                    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Relaciones Detalladas

### **1. Users ↔ Groups (Many-to-Many)**
```
users (1) ──── (N) group_members (N) ──── (1) groups
```
- Un usuario puede pertenecer a múltiples grupos
- Un grupo puede tener múltiples usuarios
- La tabla `group_members` actúa como tabla intermedia

### **2. Users ↔ Expenses (One-to-Many)**
```
users (1) ──── (N) expenses
```
- Un usuario puede tener múltiples gastos
- Cada gasto pertenece a un solo usuario

### **3. Groups ↔ Expenses (Many-to-Many)**
```
groups (1) ──── (N) group_expenses (N) ──── (1) expenses
```
- Un grupo puede tener múltiples gastos
- Un gasto puede pertenecer a múltiples grupos
- La tabla `group_expenses` almacena información adicional

### **4. Users ↔ Invitations (One-to-Many)**
```
users (1) ──── (N) invitations
```
- Un usuario puede enviar múltiples invitaciones
- Cada invitación es enviada por un solo usuario

### **5. Users ↔ Debt Payments (Many-to-Many)**
```
users (1) ──── (N) debt_payments (N) ──── (1) users
```
- Un usuario puede hacer múltiples pagos
- Un usuario puede recibir múltiples pagos
- Auto-relación en la tabla `users`

## 📋 Estructura de Tablas

### **users**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **expenses**
```sql
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
```

### **groups**
```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **group_members**
```sql
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
```

### **group_expenses**
```sql
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
```

### **invitations**
```sql
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  inviter_id INTEGER REFERENCES users(id),
  invitee_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);
```

### **debt_payments**
```sql
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
```

## 🔍 Índices Recomendados

```sql
-- Índices para optimizar consultas frecuentes
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

## 🚀 Consultas Optimizadas

### **Obtener gastos de un usuario con estadísticas**
```sql
SELECT 
  e.*,
  COUNT(*) OVER() as total_count,
  SUM(e.monto) OVER() as total_amount
FROM expenses e
WHERE e.user_id = $1
ORDER BY e.fecha DESC;
```

### **Obtener miembros de un grupo con información de usuario**
```sql
SELECT 
  gm.*,
  u.nombre,
  u.email
FROM group_members gm
JOIN users u ON gm.user_id = u.id
WHERE gm.group_id = $1 AND gm.status = 'active';
```

### **Calcular deudas entre miembros**
```sql
WITH member_expenses AS (
  SELECT 
    gm.user_id,
    SUM(ge.amount) as total_spent
  FROM group_members gm
  JOIN group_expenses ge ON gm.group_id = ge.group_id
  WHERE gm.group_id = $1
  GROUP BY gm.user_id
),
member_payments AS (
  SELECT 
    payer_id,
    receiver_id,
    SUM(amount) as total_paid
  FROM debt_payments
  WHERE group_id = $1
  GROUP BY payer_id, receiver_id
)
SELECT 
  u.nombre,
  me.total_spent,
  COALESCE(SUM(mp.total_paid), 0) as total_paid,
  me.total_spent - COALESCE(SUM(mp.total_paid), 0) as balance
FROM member_expenses me
JOIN users u ON me.user_id = u.id
LEFT JOIN member_payments mp ON me.user_id = mp.payer_id
GROUP BY u.id, u.nombre, me.total_spent;
```
