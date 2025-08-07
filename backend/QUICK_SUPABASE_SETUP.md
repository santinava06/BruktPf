# ⚡ Configuración Rápida de Supabase - Brukt

## 🚀 Pasos Esenciales (5 minutos)

### **1. Crear Proyecto Supabase**
```
1. Ve a supabase.com
2. "Start your project"
3. Nombre: brukt-finanzas
4. Password: tu-password-segura
5. Region: US East (o más cercana)
```

### **2. Obtener Credenciales**
```
1. Settings → Database
2. Copia Connection string
3. Anota: Host, Password
```

### **3. Configurar .env**
```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password-del-proyecto
JWT_SECRET=tu-super-secret-key
JWT_EXPIRES_IN=365d
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

### **4. Probar Conexión**
```bash
npm run test:db
```

### **5. Crear Tablas**
```bash
npm run db:sync
```

## ✅ Verificación

Si todo está bien, deberías ver:
```
✅ Conexión exitosa!
📊 Versión de PostgreSQL: 15.x
📋 Tablas encontradas:
   ✅ debt_payments
   ✅ expenses
   ✅ group_expenses
   ✅ group_members
   ✅ groups
   ✅ invitations
   ✅ users
🎉 ¡Conexión a Supabase configurada correctamente!
```

## 🚨 Si hay errores:

### **Error de conexión:**
- Verifica que el proyecto esté activo en Supabase
- Revisa las credenciales en .env
- Asegúrate de que el host sea correcto

### **Error de SSL:**
- Verifica que `rejectUnauthorized: false` esté en database.js
- Asegúrate de que la configuración SSL esté correcta

### **Error de autenticación:**
- Verifica usuario y contraseña
- Asegúrate de que el usuario tenga permisos

## 📋 Para Render (Producción)

Variables de entorno en Render:
```env
DB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password-del-proyecto
JWT_SECRET=tu-super-secret-key-muy-segura
JWT_EXPIRES_IN=365d
PORT=10000
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

## 🔗 Enlaces Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Documentación:** https://supabase.com/docs
- **Guía Completa:** `SUPABASE_SETUP.md`

## 🎯 Próximos Pasos

1. ✅ Configurar Supabase
2. 🔄 Desplegar Backend en Render
3. 🔄 Desplegar Frontend en Vercel
4. 🧪 Probar aplicación completa
