export function formatNumberUS(value, { maxFractionDigits = 2 } = {}) {
  if (value === null || value === undefined || value === "-" || value === "") return "-";
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return String(value);

  const isInteger = Number.isInteger(num);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: isInteger ? 0 : 0, // show up to 2 decimals if present
  }).format(num);
}