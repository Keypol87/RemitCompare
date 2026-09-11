# Guía de APIs para RemitCompare

## 📋 Resumen

RemitCompare utiliza varias APIs externas para obtener datos en tiempo real:
- **Precios de criptomonedas**: CoinGecko, CoinMarketCap
- **Tipos de cambio fiat**: Exchange Rates API, Open Exchange Rates, Frankfurter (gratis)
- **Gas fees blockchain**: ETH Gas Station

## 🔑 Obtención de API Keys

### 1. CoinGecko API (Recomendada)

**Plan gratuito**: 30 llamadas/minuto, 10,000 llamadas/mes

#### Pasos para obtener la API key:

1. Ve a [https://www.coingecko.com/en/api](https://www.coingecko.com/en/api)
2. Haz clic en **"Get your API key"**
3. Regístrate con tu email o cuenta de Google
4. Verifica tu email
5. Ve al [Dashboard](https://www.coingecko.com/en/api/dashboard)
6. Copia tu **Demo API Key**
7. Añádela a tu archivo `.env`:
   ```
   VITE_COINGECKO_API_KEY=tu_api_key_aqui
   ```

**Nota**: CoinGecko funciona SIN API key (limitado a 10-30 llamadas/minuto), pero con key tienes mejor rate limit.

---

### 2. CoinMarketCap API (Alternativa)

**Plan gratuito**: 333 llamadas/día, 10,000 llamadas/mes

#### Pasos para obtener la API key:

1. Ve a [https://coinmarketcap.com/api/](https://coinmarketcap.com/api/)
2. Haz clic en **"Get started"**
3. Crea una cuenta
4. Ve a tu [Dashboard](https://pro.coinmarketcap.com/dashboard)
5. Haz clic en **"Account Settings"** → **"API Keys"**
6. Copia tu **API Key**
7. Añádela a tu archivo `.env`:
   ```
   VITE_COINMARKETCAP_API_KEY=tu_api_key_aqui
   ```

---

### 3. Exchange Rates API

**Plan gratuito**: 100 llamadas/mes

#### Pasos para obtener la API key:

1. Ve a [https://exchangeratesapi.io/](https://exchangeratesapi.io/)
2. Haz clic en **"Get free API key"**
3. Regístrate con tu email
4. Verifica tu email
5. Ve al [Dashboard](https://manage.exchangeratesapi.io/dashboard)
6. Copia tu **Access Key**
7. Añádela a tu archivo `.env`:
   ```
   VITE_EXCHANGE_RATES_API_KEY=tu_api_key_aqui
   ```

---

### 4. Open Exchange Rates (Alternativa)

**Plan gratuito**: 1,000 llamadas/mes

#### Pasos para obtener la API key:

1. Ve a [https://openexchangerates.org/](https://openexchangerates.org/)
2. Haz clic en **"Sign up"**
3. Selecciona el plan **Free**
4. Completa el registro
5. Ve al [Dashboard](https://openexchangerates.org/account)
6. Copia tu **App ID**
7. Añádela a tu archivo `.env`:
   ```
   VITE_OPEN_EXCHANGE_RATES_API_KEY=tu_app_id_aqui
   ```

---

### 5. Frankfurter API (Gratis, sin key)

**Plan gratuito**: Sin límite, sin API key requerida

Esta API es completamente gratuita y no requiere autenticación. La aplicación ya la usa como fallback.

- URL: https://api.frankfurter.app/
- No requiere configuración

---

## ⚙️ Configuración en Vite

### Paso 1: Crear archivo `.env`

En la raíz de tu proyecto, crea un archivo llamado `.env`:

```bash
# .env
VITE_COINGECKO_API_KEY=CG-demo123456789
VITE_COINMARKETCAP_API_KEY=
VITE_EXCHANGE_RATES_API_KEY=
VITE_OPEN_EXCHANGE_RATES_API_KEY=
```

### Paso 2: Añadir `.env` al `.gitignore`

Asegúrate de que tu `.gitignore` incluya:

```
.env
.env.local
.env.*.local
```

### Paso 3: Usar las variables en tu código

En Vite, las variables de entorno deben empezar con `VITE_` para ser accesibles en el frontend:

```typescript
const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
```

---

## 🚀 Uso en la aplicación

### Hook personalizado `useMarketData`

La aplicación incluye un hook que maneja automáticamente:
- Fetch de datos de APIs
- Caché y refresh automático
- Fallback a datos de demostración si las APIs fallan
- Indicador de si se están usando datos reales o demo

```typescript
import { useMarketData } from './hooks/useMarketData';

function MyComponent() {
  const {
    cryptoPrices,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,
    refresh,
    isUsingDemoData,
  } = useMarketData(60000); // Refresh cada 60 segundos

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isUsingDemoData && <p>⚠️ Usando datos de demostración</p>}
      <p>Última actualización: {lastUpdated?.toLocaleString()}</p>
      {/* Tu código aquí */}
    </div>
  );
}
```

---

## 📊 Comparación de APIs

| API | Plan Gratis | Rate Limit | Requiere Key | Recomendada para |
|-----|-------------|------------|--------------|------------------|
| CoinGecko | 10,000 llamadas/mes | 30/min | No (opcional) | ✅ Criptomonedas |
| CoinMarketCap | 10,000 llamadas/mes | 333/día | Sí | Criptomonedas (alternativa) |
| Exchange Rates API | 100 llamadas/mes | 100/mes | Sí | Tipos de cambio |
| Open Exchange Rates | 1,000 llamadas/mes | 1,000/mes | Sí | Tipos de cambio (alternativa) |
| Frankfurter | Ilimitado | Sin límite | No | ✅ Tipos de cambio (gratis) |

---

## 🔒 Seguridad

### ⚠️ Importante: Variables de entorno en el frontend

Las variables `VITE_*` se exponen en el código JavaScript final. Esto es seguro para API keys de servicios públicos como CoinGecko, pero:

1. **NO uses keys de servicios privados** (como bases de datos) en el frontend
2. **Implementa rate limiting** en el backend si es necesario
3. **Usa un backend proxy** para APIs sensibles

### Ejemplo de backend proxy (Node.js/Express)

```javascript
// backend/server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/api/crypto-prices', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum',
      {
        headers: {
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(3000);
```

---

## 🧪 Testing de APIs

### Probar CoinGecko sin API key:

```bash
curl "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum"
```

### Probar Frankfurter (sin key):

```bash
curl "https://api.frankfurter.app/latest?from=USD"
```

### Probar con API key:

```bash
curl -H "x-cg-demo-api-key: TU_API_KEY" \
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin"
```

---

## 🐛 Troubleshooting

### Error 429: Too Many Requests

**Causa**: Excediste el rate limit de la API

**Solución**:
- Espera 1 minuto antes de hacer más requests
- Implementa caché en tu aplicación
- Considera upgrade al plan de pago
- Usa un backend proxy con caché

### Error 401: Unauthorized

**Causa**: API key inválida o no configurada

**Solución**:
- Verifica que la key esté en el archivo `.env`
- Asegúrate de que empiece con `VITE_`
- Reinicia el servidor de desarrollo
- Verifica que copiaste la key completa

### Datos no se actualizan

**Causa**: Las APIs están en modo demo o no configuradas

**Solución**:
- Revisa la consola del navegador para errores
- Verifica que las API keys están configuradas
- La aplicación usa datos de demostración si las APIs fallan
- Busca el indicador "⚠️ Usando datos de demostración"

---

## 💰 Costos estimados

### Para uso personal / MVP:
- **CoinGecko Free**: $0/mes
- **Frankfurter**: $0/mes
- **Total**: $0/mes ✅

### Para producción (tráfico moderado):
- **CoinGecko Pro**: $129/mes (500 llamadas/min)
- **Exchange Rates API**: $10/mes (10,000 llamadas)
- **Total**: ~$139/mes

### Para producción (alto tráfico):
- **CoinGecko Enterprise**: $500+/mes
- **Open Exchange Rates**: $50/mes
- **Backend proxy con Redis**: $20/mes
- **Total**: ~$570+/mes

---

## 📚 Recursos adicionales

- [Documentación CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [Documentación CoinMarketCap API](https://coinmarketcap.com/api/documentation/v1/)
- [Documentación Exchange Rates API](https://exchangeratesapi.io/documentation/)
- [Documentación Frankfurter API](https://www.frankfurter.app/docs/)
- [Variables de entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Checklist de configuración

- [ ] Crear archivo `.env` en la raíz del proyecto
- [ ] Obtener API key de CoinGecko (opcional pero recomendado)
- [ ] Añadir `VITE_COINGECKO_API_KEY` al archivo `.env`
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Probar que las APIs funcionan (ver consola del navegador)
- [ ] Verificar que no aparece "⚠️ Usando datos de demostración"
- [ ] Configurar refresh interval apropiado (60s recomendado)

---

## 🎯 Recomendación para empezar

Para comenzar rápidamente sin configurar APIs:

1. **No configures ninguna API key** - La aplicación funcionará con datos de demostración
2. **Prueba la funcionalidad** completa de la aplicación
3. **Cuando estés listo para producción**, obtén las API keys:
   - CoinGecko (gratis, recomendado)
   - Frankfurter (gratis, ya configurado)

Esto te permite desarrollar y probar sin costos iniciales.

---

¿Necesitas ayuda con algún paso específico? ¿Quieres que te ayude a configurar el backend proxy para mayor seguridad?
