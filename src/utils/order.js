export const FREE_SHIPPING_THRESHOLD = 750;
export const SHIPPING_FEE = 60;

export function calculateOrderTotals(subtotal) {
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { shipping, total: subtotal + shipping };
}
