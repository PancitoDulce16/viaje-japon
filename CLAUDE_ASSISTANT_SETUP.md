# 🤖 Claude AI Assistant - Instrucciones de Setup

## ✅ Lo que ya está hecho:

1. ✅ Firebase Function creada (`functions/index.js`)
2. ✅ Módulo frontend creado (`js/claude-assistant.js`)
3. ✅ Botón flotante agregado al dashboard
4. ✅ Dependencias instaladas
5. ✅ Todo committeado y pusheado a GitHub

---

## 🔑 Paso 1: Configurar API Key de Claude (CRÍTICO)

**Necesitas tu NUEVA API key** (la que creaste después de revocar la anterior).

### Configura el secret:

```bash
firebase functions:secrets:set CLAUDE_API_KEY
```

Te preguntará por la key. **Pega tu API key** y presiona Enter.

**NOTA:** La key estará encriptada y segura en Firebase. Nunca estará en el código.

---

## 🚀 Paso 2: Deploy de Firebase Functions

```bash
firebase deploy --only functions
```

Esto desplegará la nueva function `claudeAssistant` a Firebase.

**Tiempo estimado:** 2-3 minutos

---

## 🌐 Paso 3: Deploy de Hosting

```bash
firebase deploy --only hosting
```

Esto desplegará el frontend con el botón del asistente.

**Tiempo estimado:** 1-2 minutos

---

## ✨ ¡Listo! Cómo usar el asistente

1. **Ve a tu app:** https://japan-itin-dev.web.app/
2. **Verás un botón flotante morado con 🤖** (esquina inferior derecha, arriba del botón de logs)
3. **Click en el botón** para abrir el asistente
4. **Haz preguntas como:**
   - "¿Qué lugares recomiendas visitar hoy?"
   - "Optimiza mi ruta de hoy"
   - "¿Dónde puedo comer cerca de Shibuya?"
   - "Dame tips para visitar Fushimi Inari"
   - "¿Cuánto cuesta entrar a Shibuya Sky?"

---

## 🎯 Funcionalidades del Asistente:

✨ **Sugerencias personalizadas** basadas en tu itinerario actual
🗺️ **Optimización de rutas** para tu día
💡 **Recomendaciones** de lugares cercanos
🍜 **Info sobre restaurantes** y comida
🕐 **Horarios, costos, cómo llegar** a cada lugar
📍 **Contexto inteligente** - sabe qué día estás viendo

---

## 🔒 Seguridad:

- ✅ API key encriptada como secret en Firebase
- ✅ Solo usuarios autenticados pueden usar el asistente
- ✅ Backend valida tokens de Firebase Auth
- ✅ Rate limiting automático de Firebase

---

## 🐛 Troubleshooting:

### Error: "Claude API not configured"
- No configuraste el secret. Ejecuta el Paso 1.

### Error: "Unauthorized"
- Asegúrate de estar logueado en la app.

### El botón no aparece
- Hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- Verifica que el deploy de hosting se completó.

### Function timeout
- Claude puede tardar 5-10 segundos en responder. Es normal.

---

## 💰 Costos:

**Claude API (Anthropic):**
- Modelo usado: Claude 3.5 Sonnet
- ~$3 por millón de tokens de input
- ~$15 por millón de tokens de output
- Una conversación típica: ~1,000 tokens = $0.01 - $0.02

**Firebase Functions:**
- 2 millones de invocaciones gratis al mes
- Después: $0.40 por millón

**Total estimado:** Muy bajo para uso personal (~$1-5/mes máximo)

---

## 📊 Monitoreo:

Ver logs de la function:
```bash
firebase functions:log
```

Ver uso de Claude:
https://console.anthropic.com/usage

---

¿Preguntas? Revisa los logs con el botón 📤 y compártelos conmigo.

**¡Disfruta tu asistente de viaje IA! 🎉**
