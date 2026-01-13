# 🔧 Cómo Configurar INTERNAL_DATABASE_URL en Render

Esta guía te ayudará a configurar `INTERNAL_DATABASE_URL` en Render para resolver el error SASL.

## 📋 Pasos para Configurar INTERNAL_DATABASE_URL

### Paso 1: Acceder a tu Base de Datos PostgreSQL en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. En la lista de servicios, encuentra tu base de datos PostgreSQL
3. Haz clic en el nombre de la base de datos para abrir sus detalles

### Paso 2: Obtener la Internal Database URL

1. En la página de detalles de la base de datos, busca la sección **"Connections"** o **"Info"**
2. Verás dos URLs:
   - **External Database URL**: Para conexiones desde fuera de Render
   - **Internal Database URL**: Para conexiones desde servicios dentro de Render ⭐ **USA ESTA**

3. Copia la **Internal Database URL**
   - Se ve algo como: `postgresql://usuario:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/database_name`

### Paso 3: Configurar la Variable de Entorno en tu Servicio Web

1. Ve a tu servicio web (backend) en Render
2. Haz clic en el nombre del servicio para abrir sus detalles
3. Ve a la pestaña **"Environment"** en el menú lateral
4. En la sección de variables de entorno, haz clic en **"Add Environment Variable"**
5. Configura:
   - **Key**: `INTERNAL_DATABASE_URL`
   - **Value**: Pega la Internal Database URL que copiaste
6. Haz clic en **"Save Changes"**

### Paso 4: Verificar la Configuración

1. Después de guardar, Render automáticamente hará un nuevo despliegue
2. Puedes verificar en los logs que la variable esté configurada
3. El código usará automáticamente `INTERNAL_DATABASE_URL` si está disponible (tiene prioridad sobre `DATABASE_URL`)

## 🔍 Verificación

Después del despliegue, revisa los logs del servicio. Deberías ver:

```
✅ Conexión a PostgreSQL establecida correctamente.
📊 Base de datos: Conexión via DATABASE_URL
```

Si ves esto, la conexión está funcionando correctamente.

## ⚠️ Notas Importantes

- **INTERNAL_DATABASE_URL** es más confiable que DATABASE_URL porque:
  - Es más rápida (conexión interna en la misma región)
  - Evita problemas de SSL/TLS externos
  - Es más segura (no expuesta externamente)

- Si ya tienes `DATABASE_URL` configurada, puedes mantenerla como respaldo
- El código usará `INTERNAL_DATABASE_URL` primero si está disponible

## 🐛 Si Aún Tienes Problemas

Si después de configurar `INTERNAL_DATABASE_URL` sigues viendo el error SASL:

1. **Usa Node.js 20** (ya deberías tenerlo):
   - Verifica que `NODE_VERSION=20.18.0` esté configurado
   - Si no, agrégalo como variable de entorno

2. **Intenta deshabilitar SSL temporalmente** (solo para debugging):
   - Agrega la variable: `DB_SSL_MODE=disable`
   - Esto deshabilitará SSL para ver si ese es el problema
   - ⚠️ **Nota**: Render puede requerir SSL, así que esto puede no funcionar

3. **Verifica que la base de datos esté activa**:
   - Asegúrate de que el estado de la base de datos sea "Available"
   - Verifica que la base de datos y el servicio web estén en la misma región

4. **Revisa los logs**:
   - Los logs mostrarán qué URL está usando el código
   - Verifica que la URL sea correcta
   - Busca mensajes como: `🔧 Configurando conexión a: ...`

5. **Última opción: Verificar la URL manualmente**:
   - Asegúrate de que la Internal Database URL no tenga caracteres especiales mal codificados
   - Verifica que la contraseña en la URL no tenga caracteres que necesiten encoding

## 📸 Imágenes de Referencia

### Dónde encontrar Internal Database URL:
```
Base de Datos PostgreSQL → Info/Connections → Internal Database URL
```

### Dónde agregar la variable:
```
Servicio Web → Environment → Add Environment Variable
Key: INTERNAL_DATABASE_URL
Value: [pegar la URL interna]
```

## ✅ Checklist

- [ ] Accedí a mi base de datos PostgreSQL en Render
- [ ] Copié la Internal Database URL
- [ ] Agregué la variable `INTERNAL_DATABASE_URL` en mi servicio web
- [ ] Guardé los cambios
- [ ] Verifiqué que el despliegue se completó
- [ ] Revisé los logs para confirmar la conexión

