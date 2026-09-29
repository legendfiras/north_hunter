export function formatPrice(amount: number) {
  const digits = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${digits}`;
}
