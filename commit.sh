#!/bin/bash
# Script para hacer commit de todos los cambios

echo "🚀 Haciendo commit de todas las mejoras..."

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "✨ Implementación completa del modo colaborativo

🎉 NUEVAS FUNCIONALIDADES:
- ✅ Packing List sincronizado con trips (preparation.js)
- ✅ Notas sincronizadas con trips (core.js)
- ✅ Sistema de invitación de miembros (trips-manager.js)
- ✅ Función de unirse a viajes existentes
- ✅ Re-inicialización automática de todos los módulos
- ✅ Indicadores visuales del modo de sincronización

🔄 MÓDULOS ACTUALIZADOS:
- preparation.js: Packing list colaborativo con sync en tiempo real
- core.js: Notas colaborativas con sync en tiempo real
- trips-manager.js: Invitar miembros, unirse a trips, re-init completa
- IMPLEMENTATION_STATUS.md: Documentación completa actualizada
- GUIA_RAPIDA.md: Guía de uso para el modo colaborativo

🤝 MODO COLABORATIVO:
- Budget, Checklist, Packing List, Notas - TODO sincronizado
- Cambios en tiempo real entre todos los miembros
- Indicadores de quién hizo cada cambio
- Sistema híbrido: funciona offline y online

📊 SISTEMA COMPLETO:
Ahora puedes compartir tu viaje con tu hermano y ver cambios
instantáneamente en todos los dispositivos. ¡Lista para Japón! 🇯🇵✈️"

# Push to remote
git push origin main

echo "✅ Cambios guardados y sincronizados con GitHub!"
