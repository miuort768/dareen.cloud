const { prisma } = require('../utils/prisma');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const RATE_CACHE_TTL = 300000;
const SETTINGS_CACHE_TTL = 600000;

async function getReportCurrency() {
  const cached = await cache.get('currency:reportCurrency');
  if (cached) return cached;
  const setting = await prisma.financialSetting.findUnique({ where: { key: 'reportCurrency' } });
  const value = setting?.value || 'KWD';
  await cache.set('currency:reportCurrency', value, SETTINGS_CACHE_TTL);
  return value;
}

async function getDecimalPlaces() {
  const cached = await cache.get('currency:decimalPlaces');
  if (cached) return parseInt(cached, 10);
  const setting = await prisma.financialSetting.findUnique({ where: { key: 'decimalPlaces' } });
  const value = setting?.value ? parseInt(setting.value, 10) : 3;
  await cache.set('currency:decimalPlaces', String(value), SETTINGS_CACHE_TTL);
  return value;
}

async function getRoundingMode() {
  const cached = await cache.get('currency:roundingMode');
  if (cached) return cached;
  const setting = await prisma.financialSetting.findUnique({ where: { key: 'roundingMode' } });
  const value = setting?.value || 'HALF_UP';
  await cache.set('currency:roundingMode', value, SETTINGS_CACHE_TTL);
  return value;
}

function roundMoneyAmount(amount, decimals, mode) {
  const factor = Math.pow(10, decimals);
  let rounded;
  if (mode === 'HALF_UP') {
    rounded = Math.round(amount * factor) / factor;
  } else if (mode === 'HALF_DOWN') {
    rounded = Math.floor(amount * factor + 0.499999) / factor;
  } else if (mode === 'CEILING') {
    rounded = Math.ceil(amount * factor) / factor;
  } else if (mode === 'FLOOR') {
    rounded = Math.floor(amount * factor) / factor;
  } else {
    rounded = Math.round(amount * factor) / factor;
  }
  return rounded;
}

async function roundMoney(amount) {
  const decimals = await getDecimalPlaces();
  const mode = await getRoundingMode();
  return roundMoneyAmount(amount, decimals, mode);
}

function parsePrismaDecimal(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (val.toString) return parseFloat(val.toString());
  return Number(val);
}

async function getLatestRate(fromCurrency, toCurrency, date) {
  if (fromCurrency === toCurrency) return 1;

  const cacheKey = `currency:rate:${fromCurrency}:${toCurrency}:${date || 'latest'}`;
  const cached = await cache.get(cacheKey);
  if (cached !== null) return cached;

  const targetDate = date || new Date().toISOString().slice(0, 10);

  let rate = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency,
      toCurrency,
      effectiveDate: { lte: new Date(targetDate) },
    },
    orderBy: { effectiveDate: 'desc' },
  });

  if (!rate) {
    rate = await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency: toCurrency,
        toCurrency: fromCurrency,
        effectiveDate: { lte: new Date(targetDate) },
      },
      orderBy: { effectiveDate: 'desc' },
    });
    if (rate) {
      const buyRate = parsePrismaDecimal(rate.buyRate);
      const result = buyRate ? 1 / buyRate : null;
      await cache.set(cacheKey, result, RATE_CACHE_TTL);
      return result;
    }
    await cache.set(cacheKey, null, RATE_CACHE_TTL);
    return null;
  }

  const result = parsePrismaDecimal(rate.buyRate);
  await cache.set(cacheKey, result, RATE_CACHE_TTL);
  return result;
}

async function convert(amount, fromCurrency, toCurrency, date) {
  if (fromCurrency === toCurrency) return amount;
  const rate = await getLatestRate(fromCurrency, toCurrency, date);
  if (rate === null) {
    throw new Error(`No exchange rate found for ${fromCurrency} → ${toCurrency}`);
  }
  const converted = amount * rate;
  return roundMoney(converted);
}

async function formatMoney(amount, currency) {
  const decimals = await getDecimalPlaces();
  const value = roundMoneyAmount(amount, decimals, await getRoundingMode());
  const formatted = `${value.toFixed(decimals)} ${currency}`;
  return { value, currency, formatted };
}

function invalidateRateCache() {
  cache.delPattern('currency:rate:');
}

function invalidateSettingsCache() {
  cache.del('currency:reportCurrency');
  cache.del('currency:decimalPlaces');
  cache.del('currency:roundingMode');
}

module.exports = {
  getReportCurrency,
  getDecimalPlaces,
  getRoundingMode,
  roundMoney,
  roundMoneyAmount,
  getLatestRate,
  convert,
  formatMoney,
  invalidateRateCache,
  invalidateSettingsCache,
};
