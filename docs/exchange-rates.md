# Exchange Rate Implementation

## Overview

The finance tracker uses a dual-source approach for exchange rates to ensure reliability and accuracy, especially for Malaysian Ringgit (MYR) conversions.

## Data Sources

### Primary: Bank Negara Malaysia (BNM) API

- **URL**: `https://api.bnm.gov.my/public/exchange-rate`
- **Cost**: Free, no API key required
- **Update Frequency**: Daily
- **Coverage**: MYR exchange rates against major currencies
- **Rate Types**: Provides buying, middle, and selling rates (we use middle rate)
- **Reliability**: Official rates from Malaysia's central bank

**Supported Currencies via BNM**:
- USD (US Dollar)
- SGD (Singapore Dollar)
- EUR (Euro)
- GBP (British Pound)
- JPY (Japanese Yen)
- And many more...

### Fallback: ExchangeRate-API

- **URL**: `https://www.exchangerate-api.com/`
- **Cost**: Free tier available, paid plans for higher limits
- **API Key**: Required (set `EXCHANGE_RATE_API_KEY` in `.env`)
- **Coverage**: Global currency conversions
- **Features**: Current and historical rates

## Implementation Details

### Rate Fetching Strategy

1. **MYR-involved conversions**: Always try BNM API first
   - MYR → Other currency
   - Other currency → MYR
   - Cross-rates via MYR (e.g., USD → SGD via MYR)

2. **Non-MYR conversions**: Use fallback API
   - Direct conversion using ExchangeRate-API

3. **Historical rates**: Use fallback API only
   - BNM API doesn't provide historical data

### Caching

- Exchange rates are cached for 1 hour
- Reduces API calls and improves performance
- Cache is in-memory (resets on server restart)

### Cross-Rate Calculation

For conversions not involving MYR directly (e.g., USD to SGD):
```
USD → MYR (using BNM rate)
MYR → SGD (using BNM rate)
Final rate = USD_to_MYR × MYR_to_SGD
```

## API Endpoints

### Get Current Rates
```
GET /api/currencies/rates?base=MYR
```

### Convert Currency
```
POST /api/currencies/convert
{
  "amount": 100,
  "from": "USD",
  "to": "MYR"
}
```

### Get Historical Rates
```
GET /api/currencies/history?from=USD&to=MYR&date=2024-01-01
```

## Configuration

### Environment Variables

```env
# Optional: Only needed for fallback API or historical rates
EXCHANGE_RATE_API_KEY=your_api_key_here
```

### Getting an API Key

1. Visit https://www.exchangerate-api.com/
2. Sign up for a free account
3. Copy your API key
4. Add to `.env.local` file

## Error Handling

The service gracefully handles failures:
- If BNM API fails, automatically falls back to ExchangeRate-API
- If both fail, returns `null` and logs error
- Cached rates are used when available to minimize failures

## Usage Example

```typescript
import { exchangeRateService } from '@/lib/market-data/exchange-rates';

// Get current rate
const rate = await exchangeRateService.getExchangeRate('USD', 'MYR');

// Convert amount
const converted = await exchangeRateService.convertCurrency(100, 'USD', 'MYR');

// Get all rates for supported currencies
const allRates = await exchangeRateService.getAllRates();
```

## Benefits

1. **Accuracy**: Official BNM rates for MYR conversions
2. **Reliability**: Fallback ensures service continuity
3. **Performance**: Caching reduces API calls
4. **Cost**: Primary source is free with no limits
5. **Compliance**: Using official central bank rates for financial tracking
