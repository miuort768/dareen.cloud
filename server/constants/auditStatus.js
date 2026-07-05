const AUDIT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  WARNING: 'WARNING',
};

const VALID_STATUSES = new Set(Object.values(AUDIT_STATUS));

function isValidStatus(status) {
  return VALID_STATUSES.has(status);
}

module.exports = { AUDIT_STATUS, VALID_STATUSES, isValidStatus };
