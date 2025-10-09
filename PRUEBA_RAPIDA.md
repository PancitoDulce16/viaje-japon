# 🚀 GUÍA DE PRUEBA RÁPIDA - 5 MINUTOS

## ✅ TODO LISTO - PRUÉBALO AHORA

### Paso 1: Iniciar la App (30 segundos)
```bash
cd C:\Users\Noelia\Documents\GitHub\viaje-japon
python -m http.server 8000
```
Luego abre: http://localhost:8000

---

## 🧪 PRUEBAS BÁSICAS

### ✅ Test 1: Landing Page (30 segundos)
**Qué esperar:**
1. Abre la app
2. ✅ Debe aparecer landing page PRIMERO (no la app)
3. ✅ Debe ver formulario de login/registro
4. ✅ Debe ver descripción de features
5. ✅ NO debe ver el dashboard hasta hacer login

---

### ✅ Test 2: Crear Cuenta y Viaje (2 minutos)
**Pasos:**
1. Click en "Registrarse"
2. Ingresa email y contraseña
3. Click "Crear Cuenta"
4. ✅ Debe mostrar dashboard (ya NO landing page)
5. ✅ Debe mostrar botón "Crear Viaje"
6. Click "Crear Viaje"
7. Llena formulario:
   - Nombre: "Viaje de Prueba"
   - Fechas: Cualquier fecha futura
8. **IMPORTANTE:** Mira el checkbox "¿Usar plantilla de 15 días?"
   - ✅ SI marcas: Incluirá itinerario pre-hecho
   - ✅ SI NO marcas: Viaje vacío
9. Click "Crear Viaje"
10. ✅ Debe mostrar alerta con código de 6 dígitos (ej: AB3K5M)
11. ✅ Copia el código (lo necesitarás para el test 3)

---

### ✅ Test 3: Sistema de Invitación (2 minutos)
**Opción A - Código visible en header:**
1. Mira el header del viaje
2. ✅ Debe mostrar el código (ej: AB3K5M)
3. Click en botón "🔗 Compartir"
4. ✅ Debe copiar código al portapapeles
5. ✅ Debe mostrar alerta con el código

**Opción B - Unirse con código (necesitas 2 navegadores):**
1. Abre Chrome → Crea viaje → Anota código
2. Abre Firefox → Crea otra cuenta
3. En Firefox: Click "Unirse con Código"
4. Ingresa el código del paso 1
5. ✅ Debe decir "Te has unido al viaje exitosamente"
6. ✅ Ahora ambos navegadores ven el mismo viaje

---

### ✅ Test 4: Selector de Viajes en Itinerario (1 minuto)
**Pasos:**
1. Ve al tab "Itinerario"
2. ✅ Debe ver banner superior con:
   - Nombre del viaje actual
   - Fechas del viaje
   - Botón "Cambiar Viaje" (si tienes múltiples)
   - Botón "Compartir"
3. Si tienes plantilla marcada:
   - ✅ Debe ver días 1-15 con actividades
4. Si NO marcaste plantilla:
   - ✅ Debe ver mensaje de crear itinerario

---

### ✅ Test 5: Modo Colaborativo (2 minutos)
**Necesitas 2 navegadores (Chrome + Firefox):**

**Setup:**
1. Chrome: Crea viaje, obtén código
2. Firefox: Únete con ese código

**Prueba de sincronización:**
1. Chrome: Ve a Budget, agrega gasto "Test 1000"
2. Firefox: Abre Budget
3. ✅ El gasto debe aparecer INSTANTÁNEAMENTE en Firefox
4. Firefox: Agrega gasto "Test 2000"
5. Chrome: Actualiza Budget
6. ✅ El gasto debe aparecer INSTANTÁNEAMENTE en Chrome

**Prueba checklist:**
1. Chrome: Ve a Itinerario (si tienes plantilla)
2. Chrome: Marca una actividad
3. Firefox: Ve a Itinerario
4. ✅ La actividad debe estar marcada INSTANTÁNEAMENTE

---

## ❌ PROBLEMAS COMUNES

### "No veo la landing page"
- Asegúrate de cerrar sesión primero
- O abre en ventana incógnita

### "El código no funciona"
- Verifica que sean exactamente 6 caracteres
- Verifica mayúsculas/minúsculas
- Intenta copiar-pegar en lugar de escribir

### "No se sincroniza"
- Verifica que Firebase esté configurado
- Verifica conexión a internet
- Revisa la consola (F12) para errores

### "No aparece el checkbox de plantilla"
- Refresca la página (F5)
- Verifica que el modal se abra correctamente

---

## 📊 CHECKLIST FINAL

Marca cada uno que funcione:

**Landing Page:**
- [ ] Aparece landing page al abrir app
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Google login funciona (si configurado)
- [ ] Dashboard aparece después de login

**Crear Viaje:**
- [ ] Formulario se abre
- [ ] Checkbox de plantilla visible
- [ ] Marcando checkbox incluye plantilla
- [ ] Sin marcar crea viaje vacío
- [ ] Genera código de 6 dígitos

**Sistema de Invitación:**
- [ ] Botón "Compartir" copia código
- [ ] "Unirse con Código" funciona
- [ ] Código une a ambos usuarios

**Selector de Viajes:**
- [ ] Banner superior visible en itinerario
- [ ] Muestra viaje actual
- [ ] Botón "Cambiar Viaje" funciona
- [ ] Botón "Compartir" funciona

**Modo Colaborativo:**
- [ ] Budget sincroniza en tiempo real
- [ ] Checklist sincroniza en tiempo real
- [ ] Packing sincroniza en tiempo real
- [ ] Notas sincronizan en tiempo real

---

## 🎉 SI TODO FUNCIONA...

**¡FELICIDADES! La app está 100% lista** 🎊

Puedes:
1. ✅ Hacer commit de todos los cambios
2. ✅ Deploy a GitHub Pages / Netlify / Vercel
3. ✅ Compartir con tu hermano
4. ✅ Empezar a planificar tu viaje a Japón

---

## 🆘 SI ALGO NO FUNCIONA

1. Abre consola del navegador (F12)
2. Busca errores en rojo
3. Envíame el error específico
4. O revisa IMPLEMENTACION_FINAL.md para más detalles

---

<div align="center">

**Tiempo estimado total: 5-10 minutos**

**¡Que disfrutes planeando tu viaje! 🇯🇵✈️**

</div>
