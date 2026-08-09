# Deuda técnica aceptada

## Autenticación en navegador

El flujo usa Firebase Authentication real y su inicialización se verifica sin sesión. La prueba completa de inicio y cierre de sesión requiere una cuenta de prueba autorizada o una sesión proporcionada por el equipo. No se deben alterar proveedores, reglas ni persistencia para simularla.

## Landing pública

La landing conserva su lenguaje visual morado heredado. Está fuera del alcance del sistema visual interno hasta que exista una iniciativa específica de rediseño; no debe mezclarse con cambios funcionales.

## Rendimiento y dependencias

Vite reporta chunks superiores a 500 kB y Browserslist/caniuse-lite desactualizado. El code splitting y las actualizaciones de dependencias deben abordarse en un cambio aislado, con mediciones y pruebas propias; no junto al módulo financiero.
