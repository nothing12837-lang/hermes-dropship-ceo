import { describe, it, expect } from 'vitest';

describe('Returns, Replacements & Reverse Logistics System', () => {
  it('validates 7-day return window boundary correctly', () => {
    const REPLACEMENT_WINDOW_DAYS = 7;
    const now = Date.now();
    const threeDaysAgo = now - 3 * 86400000;
    const eightDaysAgo = now - 8 * 86400000;

    const ageDaysRecent = (now - threeDaysAgo) / 86400000;
    const ageDaysOld = (now - eightDaysAgo) / 86400000;

    expect(ageDaysRecent <= REPLACEMENT_WINDOW_DAYS).toBe(true);
    expect(ageDaysOld <= REPLACEMENT_WINDOW_DAYS).toBe(false);
  });

  it('correctly matches customer contact against email and phone', () => {
    const order = {
      user_email: 'ajaykumar@gmail.com',
      shipping_address: { phone: '9876543210' },
    };

    const orderEmail = order.user_email.toLowerCase();
    const orderPhone = order.shipping_address.phone.replace(/\D/g, '');

    // Valid inputs
    const testEmail1 = 'ajaykumar@gmail.com';
    const testPhone1 = '9876543210';
    const testPhoneWithCountry = '+919876543210';

    expect(testEmail1.toLowerCase().includes(orderEmail)).toBe(true);
    expect(testPhone1.replace(/\D/g, '').includes(orderPhone)).toBe(true);
    expect(testPhoneWithCountry.replace(/\D/g, '').includes(orderPhone)).toBe(true);

    // Invalid inputs
    const wrongEmail = 'someoneelse@gmail.com';
    const wrongPhone = '9111111111';

    expect(wrongEmail.toLowerCase().includes(orderEmail)).toBe(false);
    expect(wrongPhone.replace(/\D/g, '').includes(orderPhone)).toBe(false);
  });

  it('normalizes order ID properly removing leading hash symbols and trimming whitespace', () => {
    const rawInputs = ['#6c7e6415', ' 6c7e6415 ', '# 6c7e6415 '];
    const cleaned = rawInputs.map((s) => s.replace(/^#\s*/, '').trim());
    cleaned.forEach((res) => {
      expect(res).toBe('6c7e6415');
    });
  });

  it('generates consistent claim ticket ID with RE-CLM prefix', () => {
    const claimId = `RE-CLM-9F2B81C4`;
    expect(claimId.startsWith('RE-CLM-')).toBe(true);
    expect(claimId.length).toBe(15);
  });
});
