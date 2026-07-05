import { describe, it, expect } from 'vitest';
const { INVOICE_STATUS, VALID_TRANSITIONS, validateTransition } = require('../../../constants/invoiceStates');

describe('invoiceStates', () => {
  describe('INVOICE_STATUS', () => {
    it('defines all 9 statuses', () => {
      expect(INVOICE_STATUS.PENDING).toBe('pending');
      expect(INVOICE_STATUS.UNPAID).toBe('unpaid');
      expect(INVOICE_STATUS.PARTIALLY_PAID).toBe('partially_paid');
      expect(INVOICE_STATUS.PAID).toBe('paid');
      expect(INVOICE_STATUS.REFUNDED).toBe('refunded');
      expect(INVOICE_STATUS.CANCELLED).toBe('cancelled');
      expect(INVOICE_STATUS.OVERDUE).toBe('overdue');
      expect(INVOICE_STATUS.ABSENT).toBe('absent');
      expect(INVOICE_STATUS.REVIEWED).toBe('reviewed');
    });
  });

  describe('VALID_TRANSITIONS', () => {
    it('PENDING can go to UNPAID or CANCELLED', () => {
      expect(VALID_TRANSITIONS[INVOICE_STATUS.PENDING]).toEqual(['unpaid', 'cancelled']);
    });

    it('PAID can only go to REFUNDED', () => {
      expect(VALID_TRANSITIONS[INVOICE_STATUS.PAID]).toEqual(['refunded']);
    });

    it('REFUNDED and CANCELLED are terminal states', () => {
      expect(VALID_TRANSITIONS[INVOICE_STATUS.REFUNDED]).toEqual([]);
      expect(VALID_TRANSITIONS[INVOICE_STATUS.CANCELLED]).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    it('allows valid transitions', () => {
      expect(validateTransition('unpaid', 'paid').valid).toBe(true);
      expect(validateTransition('unpaid', 'cancelled').valid).toBe(true);
      expect(validateTransition('paid', 'refunded').valid).toBe(true);
      expect(validateTransition('pending', 'unpaid').valid).toBe(true);
      expect(validateTransition('pending', 'cancelled').valid).toBe(true);
      expect(validateTransition('partially_paid', 'paid').valid).toBe(true);
      expect(validateTransition('overdue', 'paid').valid).toBe(true);
    });

    it('blocks invalid transitions', () => {
      expect(validateTransition('paid', 'unpaid').valid).toBe(false);
      expect(validateTransition('paid', 'cancelled').valid).toBe(false);
      expect(validateTransition('refunded', 'paid').valid).toBe(false);
      expect(validateTransition('cancelled', 'paid').valid).toBe(false);
      expect(validateTransition('unpaid', 'refunded').valid).toBe(false);
    });

    it('returns error message for invalid transition', () => {
      const result = validateTransition('paid', 'unpaid');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Invalid transition');
      expect(result.message).toContain('paid');
    });

    it('returns error for unknown status', () => {
      const result = validateTransition('unknown', 'paid');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Unknown current status');
    });
  });
});
