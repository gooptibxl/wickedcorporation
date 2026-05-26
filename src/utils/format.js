/** Format prix en centimes vers "XX,XX €" (français, espace insécable). */
export function formatPrix(centimes) {
  const n = Math.round(Number(centimes) || 0)
  return (n / 100).toFixed(2).replace('.', ',') + '\u202F€'
}
