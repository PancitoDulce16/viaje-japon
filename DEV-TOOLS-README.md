# 🛠️ Japitin Dev Tools

Herramientas de desarrollo para hacer cambios rápidos y eficientes en Japitin.

## 📦 Herramientas Disponibles

### 1. 🎨 Live CSS Editor
**Archivo:** `dev-tools.html`

**¿Qué hace?**
- Edita CSS en tiempo real sin necesidad de hacer commit/deploy
- Ve los cambios instantáneamente en el preview
- Prueba estilos antes de aplicarlos permanentemente

**Cómo usar:**
1. Abre `http://localhost:5000/dev-tools.html` (o el puerto de Firebase)
2. Escribe CSS en el editor
3. Click en "▶️ Aplicar CSS"
4. Ve los cambios en la vista previa

**Ejemplo de uso:**
```css
/* Probar wallpaper en modo oscuro */
html.dark {
    background-image: url('/images/iconos/Wallpaper/Osucuro.png') !important;
    background-size: cover !important;
}
```

---

### 2. 💾 Snapshot Manager
**¿Qué hace?**
- Guarda estados del proyecto
- Restaura versiones anteriores rápidamente
- Sin necesidad de git revert

**Cómo usar:**
1. Escribe un nombre para el snapshot
2. Click en "📸 Crear Snapshot"
3. Para restaurar: Click en "↩️ Restaurar" en el snapshot deseado

**Cuándo usar:**
- Antes de hacer cambios grandes
- Después de que algo funcione bien
- Para comparar diferentes versiones

---

### 3. 🧹 CSS Cleaner
**¿Qué hace?**
- Analiza todos los archivos CSS
- Encuentra duplicados
- Identifica selectores no usados
- Calcula tamaño y optimizaciones posibles

**Cómo usar:**
1. Click en "🔍 Analizar CSS"
2. Revisa el reporte
3. (Opcional) Click en "🗑️ Limpiar Duplicados"

**Beneficios:**
- Reduce tamaño de archivos
- Mejora performance
- Código más limpio

---

### 4. 🔍 Visual Inspector
**¿Qué hace?**
- Inspecciona qué estilos se están aplicando a un elemento
- Ve CSS computado en tiempo real
- Identifica conflictos de estilos

**Cómo usar:**
1. Escribe un selector CSS (ej: `html.dark`, `.stat-card`)
2. Click en "🔎 Inspeccionar"
3. Ve los estilos aplicados

**Útil para:**
- Debuggear por qué un estilo no se aplica
- Ver qué CSS tiene prioridad
- Identificar conflictos

---

## ⚡ Quick Deploy Script

**Archivo:** `quick-deploy.bat` (Windows)

**¿Qué hace?**
Automatiza todo el proceso de deployment:
1. Git add
2. Git commit
3. Git push
4. Firebase deploy

**Cómo usar:**
```bash
# Doble click en quick-deploy.bat
# O desde terminal:
./quick-deploy.bat
```

**Ahorra tiempo:**
- De 5 comandos a 1 click
- No más olvidar pasos
- Deployment en segundos

---

## 🎯 Flujo de Trabajo Recomendado

### Para cambios CSS:
1. Abre `dev-tools.html`
2. Prueba cambios en Live CSS Editor
3. Cuando funcione, copia el CSS al archivo
4. Ejecuta `quick-deploy.bat`

### Para cambios grandes:
1. Crea un Snapshot antes de empezar
2. Haz los cambios
3. Si algo falla, restaura el Snapshot
4. Si funciona, crea otro Snapshot

### Para debuggear:
1. Usa Visual Inspector para ver qué CSS se aplica
2. Usa CSS Cleaner para ver duplicados
3. Arregla el problema
4. Deploy rápido

---

## 🚀 Acceso Rápido

### Local (Firebase Emulator):
```
http://localhost:5000/dev-tools.html
```

### Producción:
```
https://japan-itin-dev.web.app/dev-tools.html
```

---

## 💡 Tips

1. **Usa Live CSS Editor** antes de modificar archivos
2. **Crea Snapshots** regularmente
3. **Limpia CSS** cada semana
4. **Inspecciona elementos** cuando algo no funcione

---

## ⚠️ Notas Importantes

- **Dev Tools solo para desarrollo** - No compartir URL pública
- **Snapshots se guardan en localStorage** - No son permanentes
- **CSS Cleaner es experimental** - Revisar cambios antes de aplicar
- **Siempre hacer backup** antes de cambios grandes

---

## 📝 Próximas Mejoras

- [ ] Auto-save de cambios CSS
- [ ] Comparación de snapshots
- [ ] Export/import de configuraciones
- [ ] Mobile preview en diferentes tamaños
- [ ] Hot reload automático

---

Made with 💙 for efficient Japitin development
