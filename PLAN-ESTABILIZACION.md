# 🛡️ PLAN DE ESTABILIZACIÓN DEL CÓDIGO
**Objetivo**: Reducir bugs, mejorar robustez, evitar regresiones

## 🎯 Filosofía: DETENER, ESTABILIZAR, ROBUSTECER

**NO MÁS FEATURES NUEVAS** hasta que el código existente sea:
1. ✅ Robusto
2. ✅ Testeable
3. ✅ Libre de bugs conocidos

---

## 📊 FASE 1: AUDITORÍA Y DOCUMENTACIÓN (1-2 sesiones)

### 1.1 Inventario de Bugs Conocidos
- [ ] Listar TODOS los bugs conocidos/reportados
- [ ] Priorizar por severidad (crítico/alto/medio/bajo)
- [ ] Documentar casos de uso que fallan

### 1.2 Mapeo de Dependencias
- [ ] Documentar qué módulos dependen de qué
- [ ] Identificar módulos "críticos" que se usan en todo el sistema
- [ ] Marcar módulos que NO deben modificarse sin tests

### 1.3 Puntos de Fragilidad
- [ ] Identificar código que se rompe frecuentemente
- [ ] Marcar código con lógica compleja que necesita simplificación
- [ ] Documentar asunciones peligrosas (ej: "siempre habrá day.location")

---

## 🔧 FASE 2: FIXES DIRIGIDOS (3-5 sesiones)

### Regla de Oro: **UN BUG A LA VEZ, UN FIX A LA VEZ**

#### 2.1 Metodología para cada Fix:
1. **ANTES de tocar código**:
   - Escribir test case que reproduce el bug
   - Documentar comportamiento esperado vs actual
   - Identificar TODOS los lugares afectados

2. **Durante el fix**:
   - Fix MÍNIMO necesario (no "aprovechar para mejorar X")
   - Agregar validaciones defensivas
   - Agregar logs de debug

3. **DESPUÉS del fix**:
   - Verificar que el test case pasa
   - Verificar que NO rompió otros flujos (smoke test manual)
   - Deploy y verificar en producción
   - Documentar el fix en CHANGELOG

#### 2.2 Bugs Prioritarios (del más urgente al menos):
1. **CRÍTICO**: Errores de distancia ilógica (día 13, 14)
   - Status: ✅ Fix implementado, esperando verificación
   - Próximo: Verificar que funciona en producción

2. **ALTO**: Cache del navegador impide ver fixes
   - Status: ✅ Sistema de versiones implementado
   - Próximo: Verificar que auto-reload funciona

3. **MEDIO**: [Agregar bugs conocidos aquí]

4. **BAJO**: [Agregar bugs menores aquí]

---

## 🧪 FASE 3: TESTING Y VALIDACIÓN (2-3 sesiones)

### 3.1 Test Suite Básico
- [ ] Crear archivo `tests/smoke-tests.md` con casos de prueba manuales
- [ ] Documentar "happy path" para cada flujo principal:
  - Crear itinerario
  - Optimizar ruta
  - Agregar actividades
  - Cambiar ciudades
  - Detectar días mezclados

### 3.2 Validación Automática
- [ ] Agregar assertions en código crítico
- [ ] Implementar health checks automáticos
- [ ] Crear modo "strict" que falla ruidosamente en vez de silenciosamente

---

## 🏗️ FASE 4: REFACTORING CONSERVADOR (3-4 sesiones)

### Regla: **NUNCA refactorizar sin tests**

#### 4.1 Simplificación de Código Frágil
Módulos candidatos:
- `city-detection-v2.js` - ✅ Ya mejorado, pero verificar edge cases
- `auto-correction-v2.js` - Validar que maneja todos los casos
- `master-itinerary-optimizer-v2025.js` - Demasiado complejo, candidato a simplificar

#### 4.2 Principios de Refactoring:
1. **Un módulo a la vez**
2. **Mantener API pública sin cambios**
3. **Agregar tests ANTES de refactorizar**
4. **Commit después de cada mini-refactor que funciona**

---

## 📝 FASE 5: DOCUMENTACIÓN PREVENTIVA (1-2 sesiones)

### 5.1 Documentar Asunciones Peligrosas
En cada módulo crítico, agregar comentarios:
```javascript
/**
 * ⚠️ ASUNCIONES CRÍTICAS:
 * 1. day.location puede NO existir
 * 2. day.location puede NO coincidir con actividades reales
 * 3. Actividades pueden no tener coordenadas
 * 4. [etc]
 */
```

### 5.2 Guías de "Cómo NO Romper Cosas"
- [ ] `CONTRIBUTING.md` con reglas de oro
- [ ] Checklist de pre-deploy
- [ ] Guía de debugging

---

## 🚨 REGLAS DE ORO (PERMANENTES)

### ❌ NUNCA:
1. Hacer múltiples cambios no relacionados en un commit
2. "Aprovechar para arreglar" otra cosa mientras arreglas un bug
3. Confiar ciegamente en datos del usuario (siempre validar)
4. Asumir que algo "siempre está presente" sin verificar
5. Hacer deploy sin verificar manualmente primero

### ✅ SIEMPRE:
1. Un bug = un commit
2. Leer código existente ANTES de modificar
3. Agregar validaciones defensivas
4. Escribir por qué haces algo, no solo qué haces
5. Hacer smoke test manual antes de commit

---

## 📈 MÉTRICAS DE PROGRESO

### Indicadores de Éxito:
- ✅ Días sin bugs reportados: **0** → objetivo: **7+**
- ✅ Tiempo promedio de debugging por sesión: **alto** → objetivo: **<30 min**
- ✅ Regresiones por fix: **frecuentes** → objetivo: **0**
- ✅ Confianza en hacer cambios: **baja** → objetivo: **alta**

### Revisar cada semana:
- ¿Cuántos bugs nuevos aparecieron?
- ¿Cuántos bugs se resolvieron sin crear nuevos?
- ¿El código es más fácil de entender que hace una semana?

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### Sesión Actual:
1. ✅ Deploy a Firebase (HECHO)
2. ✅ Sistema de versiones implementado (HECHO)
3. ⏳ **PENDIENTE**: Verificar que el fix de city-detection funciona en prod
4. ⏳ **PENDIENTE**: Smoke test manual de optimización completa

### Próxima Sesión:
1. Si el fix funciona → Marcar bug como resuelto y cerrar
2. Si el fix NO funciona → Debugging dirigido usando logs
3. Crear smoke test checklist para evitar regresiones
4. Identificar próximo bug prioritario

---

## 💡 FILOSOFÍA GENERAL

> **"Hacer las cosas bien la primera vez cuesta menos que arreglarlas después"**

- Priorizar **claridad** sobre **cleverness**
- Priorizar **robustez** sobre **features**
- Priorizar **estabilidad** sobre **velocidad de desarrollo**

**STOP** cuando algo no está claro.
**PIENSA** antes de cambiar.
**VALIDA** después de cambiar.
