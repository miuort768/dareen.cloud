const CACHE_KEYS = {
  SETTINGS: 'settings:system',
  MONITORING: 'monitoring:overview',
  EXCHANGE_RATES: 'rates:exchange',

  financeOverview: (currency) => `finance:overview:${currency || 'all'}`,

  permissions: (roleId) => `permissions:${roleId}`,

  pattern: {
    finance: 'finance:*',
    settings: 'settings:*',
    permissions: 'permissions:*',
    monitoring: 'monitoring:*',
    rates: 'rates:*',
  },
};

module.exports = { CACHE_KEYS };
