/**
 * Quick test to verify BNM API integration
 * Run with: npx tsx lib/market-data/__tests__/bnm-api-test.ts
 */

import { exchangeRateService } from '../exchange-rates';

async function testBNMAPI() {
  console.log('Testing BNM API Integration...\n');

  // Test 1: USD to MYR
  console.log('Test 1: USD to MYR');
  const usdToMyr = await exchangeRateService.getExchangeRate('USD', 'MYR');
  console.log(`1 USD = ${usdToMyr?.toFixed(4)} MYR\n`);

  // Test 2: MYR to USD
  console.log('Test 2: MYR to USD');
  const myrToUsd = await exchangeRateService.getExchangeRate('MYR', 'USD');
  console.log(`1 MYR = ${myrToUsd?.toFixed(4)} USD\n`);

  // Test 3: SGD to MYR
  console.log('Test 3: SGD to MYR');
  const sgdToMyr = await exchangeRateService.getExchangeRate('SGD', 'MYR');
  console.log(`1 SGD = ${sgdToMyr?.toFixed(4)} MYR\n`);

  // Test 4: Cross rate USD to SGD
  console.log('Test 4: USD to SGD (cross rate via MYR)');
  const usdToSgd = await exchangeRateService.getExchangeRate('USD', 'SGD');
  console.log(`1 USD = ${usdToSgd?.toFixed(4)} SGD\n`);

  // Test 5: JPY to MYR (unit = 100)
  console.log('Test 5: JPY to MYR (per 100 units)');
  const jpyToMyr = await exchangeRateService.getExchangeRate('JPY', 'MYR');
  console.log(`1 JPY = ${jpyToMyr?.toFixed(4)} MYR`);
  console.log(`100 JPY = ${(jpyToMyr! * 100).toFixed(4)} MYR\n`);

  // Test 6: Convert 1000 USD to MYR
  console.log('Test 6: Convert 1000 USD to MYR');
  const converted = await exchangeRateService.convertCurrency(1000, 'USD', 'MYR');
  console.log(`1000 USD = ${converted?.toFixed(2)} MYR\n`);

  console.log('All tests completed!');
}

testBNMAPI().catch(console.error);
