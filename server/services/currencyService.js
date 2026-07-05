const { prisma } = require('../utils/prisma');
const cache = require('./cacheService');
const { CACHE_KEYS } = require('../cache/cacheKeys');
const logger = require('../utils/logger');

const RATE_CACHE_TTL = 300;
const SETTINGS_CACHE_TTL = 600;

async function getReportCurrency() {
  return cache.remember(CACHE_KEYS.EXCHANGE_RATES + ':reportCurrency', SETTINGS_CACHE_TTL, async () => {
    const setting = await prisma.financialSetting.findUnique({ where: { key: 'reportCurrency' } });
    return setting?.value || 'KWD';
  });
}

async function getDecimalPlaces() {
  return cache.remember(CACHE_KEYS.EXCHANGE_RATES + ':decimalPlaces', SETTINGS_CACHE_TTL, async () => {
    const setting = await prisma.financialSetting.findUnique({ where: { key: 'decimalPlaces' } });
    return setting?.value ? parseInt(setting.value, 10) : 3;
  });
}

async function getRoundingMode() {
  return cache.remember(CACHE_KEYS.EXCHANGE_RATES + ':roundingMode', SETTINGS_CACHE_TTL, async () => {
    const setting = await prisma.financialSetting.findUnique({ where: { key: 'roundingMode' } });
    return setting?.value || 'HALF_UP';
  });
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

  const cacheKey = `${CACHE_KEYS.EXCHANGE_RATES}:rate:${fromCurrency}:${toCurrency}:${date || 'latest'}`;
  const targetDate = date || new Date().toISOString().slice(0, 10);

  return cache.remember(cacheKey, RATE_CACHE_TTL, async () => {
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
        return buyRate ? 1 / buyRate : null;
      }
      return null;
    }

    return parsePrismaDecimal(rate.buyRate);
  });
}

async function convert(amount, fromCurrency, toCurrency, date) {
  if (fromCurrency === toCurrency) return amount;
  const rate = await getLatestRate(fromCurrency, toCurrency, date);
  if (rate === null) {
    logger.warn(`No exchange rate found for ${fromCurrency} → ${toCurrency}, using 1:1`);
    return roundMoney(amount);
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
  cache.invalidate('rates:exchange:rate:*');
}

function invalidateSettingsCache() {
  cache.invalidate('rates:exchange:*');
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
