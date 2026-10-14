// ONDC/Beckn adapter stub - cloud-ready, disabled until seller onboarding.
// Next: map products -> Beckn catalog, orders -> ONDC confirm.
export const ONDC_ENABLED = false;

export function toOndcCatalog(products: unknown[]) {
  if (!ONDC_ENABLED) return { disabled: true, count: Array.isArray(products) ? products.length : 0 };
  return { disabled: false, items: products };
}
