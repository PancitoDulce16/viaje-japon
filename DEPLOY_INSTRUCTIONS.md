# 🚀 Instrucciones para Deploy Automático a Firebase

## Opción 1: Configuración Automática (RECOMENDADO)

Ejecuta este comando en tu terminal (Windows PowerShell o CMD):

```bash
firebase init hosting:github
```

Este comando hará:
1. Te pedirá seleccionar el repositorio: `PancitoDulce16/viaje-japon`
2. Automáticamente creará el Service Account en Firebase
3. Configurará el secret `FIREBASE_SERVICE_ACCOUNT_JAPAN_ITIN_DEV` en GitHub
4. Creará/actualizará el workflow de GitHub Actions

Después de esto, cada vez que hagas `git push`, se desplegará automáticamente.

---

## Opción 2: Deploy Manual (LO QUE USO YO - Claude)

Cuando quieras desplegar, yo ejecutaré:

```bash
firebase deploy --only hosting
```

Y listo. No necesitas configurar nada.

---

## Opción 3: Deploy Manual Tuyo

Si quieres desplegar tú mismo:

1. Abre tu terminal en la carpeta del proyecto
2. Ejecuta:
   ```bash
   firebase deploy --only hosting
   ```
3. Espera a que termine (toma ~30 segundos)
4. Abre https://japan-itin-dev.web.app

---

## 🎯 Recomendación

**Para ahora**: Usa Opción 2 (yo hago el deploy manual cuando te lo pido)

**Para después**: Configura Opción 1 ejecutando `firebase init hosting:github` en tu computadora

---

## Verificar Deploy Actual

URL en vivo: **https://japan-itin-dev.web.app**

Última versión desplegada incluye:
✅ Header rediseñado y limpio
✅ Modo oscuro funcionando
✅ Menú hamburguesa en mobile
✅ Ordenamiento de actividades por hora
