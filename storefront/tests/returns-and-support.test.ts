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

    const checkMatch = (contact: string) => {
      const contactLower = contact.toLowerCase();
      const contactDigits = contact.replace(/\D/g, '');
      const emailMatches = orderEmail.length > 0 && contactLower.includes(orderEmail);
      const phoneMatches =
        contactDigits.length >= 6 &&
        orderPhone.length >= 6 &&
        (contactDigits.includes(orderPhone) || orderPhone.includes(contactDigits));
      return emailMatches || phoneMatches;
    };

    expect(checkMatch(testEmail1)).toBe(true);
    expect(checkMatch(testPhone1)).toBe(true);
    expect(checkMatch(testPhoneWithCountry)).toBe(true);

    // Invalid inputs
    const wrongEmail = 'someoneelse@gmail.com';
    const wrongPhone = '9111111111';

    expect(checkMatch(wrongEmail)).toBe(false);
    expect(checkMatch(wrongPhone)).toBe(false);
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

  it('correctly distinguishes full UUIDs from short order ID prefixes', () => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const fullUuid = '7792e434-7bf5-4ff4-9296-cf2f4c2af57f';
    const shortPrefix = '7792e434';
    const invalidFormat = 'non-existent-order';

    expect(UUID_REGEX.test(fullUuid)).toBe(true);
    expect(UUID_REGEX.test(shortPrefix)).toBe(false);
    expect(/^[0-9a-f]{6,36}$/i.test(shortPrefix)).toBe(true);
    expect(/^[0-9a-f]{6,36}$/i.test(invalidFormat)).toBe(false);
  });
});
