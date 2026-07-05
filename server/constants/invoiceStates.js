const INVOICE_STATUS = {
  PENDING: 'pending',
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
  ABSENT: 'absent',
  REVIEWED: 'reviewed',
};

const VALID_TRANSITIONS = {
  [INVOICE_STATUS.PENDING]: [INVOICE_STATUS.UNPAID, INVOICE_STATUS.CANCELLED],
  [INVOICE_STATUS.UNPAID]: [INVOICE_STATUS.PARTIALLY_PAID, INVOICE_STATUS.PAID, INVOICE_STATUS.CANCELLED, INVOICE_STATUS.OVERDUE],
  [INVOICE_STATUS.PARTIALLY_PAID]: [INVOICE_STATUS.PAID, INVOICE_STATUS.REFUNDED],
  [INVOICE_STATUS.PAID]: [INVOICE_STATUS.REFUNDED],
  [INVOICE_STATUS.REFUNDED]: [],
  [INVOICE_STATUS.CANCELLED]: [],
  [INVOICE_STATUS.OVERDUE]: [INVOICE_STATUS.PAID, INVOICE_STATUS.CANCELLED],
  [INVOICE_STATUS.ABSENT]: [],
  [INVOICE_STATUS.REVIEWED]: [],
};

function validateTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) {
    return { valid: false, message: `Unknown current status: ${currentStatus}` };
  }
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      message: `Invalid transition: ${currentStatus} \u2192 ${newStatus}. Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}`,
    };
  }
  return { valid: true };
}

module.exports = { INVOICE_STATUS, VALID_TRANSITIONS, validateTransition };
