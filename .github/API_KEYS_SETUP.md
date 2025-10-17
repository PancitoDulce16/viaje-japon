# Configuración de API Keys en GitHub Secrets

## Paso 1: Crear el Secret en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret**
4. Nombre del secret: `API_KEYS_JSON`
5. Copia y pega el siguiente JSON en el campo "Secret":

```json
{
  "aviationStack": {
    "apiKey": "4374cea236b04a5bf7e6d0c7d2cbf676",
    "endpoint": "http://api.aviationstack.com/v1"
  },
  "liteAPI": {
    "apiKey": "1757d988-56b3-4b5a-9618-c7b5053ac3aa",
    "searchEndpoint": "https://api.liteapi.travel/v3.0",
    "dataEndpoint": "https://api.liteapi.travel/v3.0/data",
    "bookingEndpoint": "https://book.liteapi.travel/v3.0"
  },
  "geoapify": {
    "apiKey": "4ed258337c3d4edb94841d6001273ad7",
    "endpoint": "https://api.geoapify.com/v1"
  },
  "foursquare": {
    "apiKey": "MDWP4CPLGUO1AUSDLDCWC3JHWYTWGWEJ5UXIPT3Q5DLI0EKO",
    "endpoint": "https://api.foursquare.com/v3"
  },
  "locationIQ": {
    "apiKey": "994358ef247499e7bf49de710d455da3",
    "endpoint": "https://us1.locationiq.com/v1"
  },
  "nominatim": {
    "endpoint": "https://nominatim.openstreetmap.org"
  }
}
```

6. Click en **Add secret**

## Paso 2: Verificar que el workflow esté actualizado

El workflow `.github/workflows/firebase-deploy.yml` ya está configurado para usar este secret.
La próxima vez que hagas un push, las API keys se inyectarán automáticamente.

## Paso 3: Hacer un push para activar el deployment

Después de agregar el secret, haz cualquier cambio y push para que se regenere el archivo de configuración.

## Verificación

Una vez deployado, verifica en la consola del navegador:
```javascript
console.log('API Keys configuradas:', window.API_KEYS);
console.log('LiteAPI configurada:', window.API_KEYS?.liteAPI?.apiKey ? 'Sí' : 'No');
```

Deberías ver todas las APIs configuradas.

**Estado**: ✅ Secret configurado en GitHub Actions

## Notas Importantes

⚠️ **NUNCA** commitees este archivo con las API keys reales al repositorio.
⚠️ Las API keys aquí son las de **sandbox/desarrollo**. Para producción, usa claves diferentes.
⚠️ Este archivo está en `.gitignore` para evitar commits accidentales.

## APIs Incluidas

- ✈️ **AviationStack**: Información de vuelos
- 🏨 **LiteAPI**: Búsqueda de hoteles (Sandbox)
- 🗺️ **Geoapify**: Mapas y rutas
- 📍 **Foursquare**: Lugares y atracciones
- 🌍 **LocationIQ**: Geocoding
- 🗺️ **Nominatim**: Geocoding alternativo (gratis)
