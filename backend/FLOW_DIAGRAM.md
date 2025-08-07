# 🔄 Diagrama de Flujo de Datos - Brukt

## 📱 Flujo de Autenticación

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Login Form   │───▶│ 2. Validate     │───▶│ 3. Check User   │
│    (email/pass) │    │    Credentials  │    │    Credentials  │
│                 │    │                 │    │                 │
│ 6. Store JWT    │◀───│ 5. Send JWT     │◀───│ 4. Return User  │
│    Token        │    │    Token        │    │    Data         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💰 Flujo de Gestión de Gastos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Add Expense  │───▶│ 2. Validate     │───▶│ 3. Insert       │
│    Form         │    │    Data         │    │    Expense      │
│                 │    │                 │    │                 │
│ 6. Update UI    │◀───│ 5. Send Success │◀───│ 4. Return       │
│    with New     │    │    Response     │    │    Created ID   │
│    Expense      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 👥 Flujo de Gestión de Grupos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Create Group │───▶│ 2. Validate     │───▶│ 3. Insert       │
│    Form         │    │    Group Data   │    │    Group        │
│                 │    │                 │    │                 │
│ 6. Add Creator  │◀───│ 5. Add Creator  │◀───│ 4. Return       │
│    as Member    │    │    as Member    │    │    Group ID     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Flujo de Análisis de Deudas

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Request Debt │───▶│ 2. Complex      │───▶│ 3. Execute      │
│    Analysis     │    │    Query Logic  │    │    Multiple     │
│                 │    │                 │    │    Queries      │
│ 6. Display Debt │◀───│ 5. Process &    │◀───│ 4. Return Raw   │
│    Summary      │    │    Calculate    │    │    Data         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Flujo de Invitaciones

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Send Invite  │───▶│ 2. Validate     │───▶│ 3. Insert       │
│    (email)      │    │    Email        │    │    Invitation   │
│                 │    │                 │    │                 │
│ 6. Show Success │◀───│ 5. Send Success │◀───│ 4. Return       │
│    Message      │    │    Response     │    │    Invite ID    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💸 Flujo de Pagos de Deudas

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Record       │───▶│ 2. Validate     │───▶│ 3. Insert       │
│    Payment      │    │    Payment      │    │    Payment      │
│                 │    │                 │    │                 │
│ 6. Update Debt  │◀───│ 5. Recalculate  │◀───│ 4. Return       │
│    Display      │    │    Debts        │    │    Payment ID   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛡️ Flujo de Seguridad

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. Include JWT  │───▶│ 2. Verify JWT   │───▶│ 3. Check User   │
│    in Header    │    │    Token        │    │    Exists       │
│                 │    │                 │    │                 │
│ 6. Handle Auth  │◀───│ 5. Grant/Deny   │◀───│ 4. Return User  │
│    Response     │    │    Access        │    │    Permissions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📡 Secuencia de Peticiones Típica

```
1. Usuario abre la app
   ↓
2. Frontend verifica JWT en localStorage
   ↓
3. Si no hay JWT → Redirige a Login
   ↓
4. Si hay JWT → Hace petición a /api/auth/profile
   ↓
5. Backend verifica JWT y responde con datos del usuario
   ↓
6. Frontend carga Dashboard con datos del usuario
   ↓
7. Dashboard hace petición a /api/expenses
   ↓
8. Backend consulta base de datos y responde con gastos
   ↓
9. Frontend renderiza lista de gastos
```

## 🔧 Manejo de Errores

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│                 │    │                 │    │                 │
│ 1. User Action  │───▶│ 2. Process      │───▶│ 3. Database     │
│                 │    │    Request      │    │    Operation    │
│                 │    │                 │    │                 │
│ 6. Show Error   │◀───│ 5. Send Error   │◀───│ 4. Return Error │
│    Message      │    │    Response     │    │    (if any)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Optimizaciones de Rendimiento

### **Frontend**
- **Lazy Loading:** Componentes cargados bajo demanda
- **Memoización:** Evita re-renders innecesarios
- **Caching:** Datos en localStorage/sessionStorage

### **Backend**
- **Connection Pooling:** Reutilización de conexiones DB
- **Query Optimization:** Consultas optimizadas
- **Response Caching:** Cache de respuestas frecuentes

### **Base de Datos**
- **Indexes:** Índices en campos frecuentemente consultados
- **Query Optimization:** Consultas optimizadas
- **Connection Limits:** Límites de conexiones concurrentes
