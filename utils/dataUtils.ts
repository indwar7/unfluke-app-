import { FinancialData } from "../api/unfluke";

export function getAvailableYears(data: FinancialData): string[] {
  return Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a));
}

export function getLatestYear(data: FinancialData): string | null {
  const years = getAvailableYears(data);
  return years.length > 0 ? years[0] : null;
}

export function findMetricValue(data: FinancialData, year: string, metricKey: string): number | string | null {
  const blocks = data[year];
  if (!blocks) return null;
  for (const block of blocks) {
    if (block[metricKey] !== undefined) return block[metricKey];
  }
  return null;
}

export function flattenYearData(data: FinancialData, year: string): Record<string, number | string> {
  const blocks = data[year] || [];
  const flattened: Record<string, number | string> = {};
  for (const block of blocks) {
    Object.assign(flattened, block);
  }
  return flattened;
}

export function formatIndianNumber(value: number | string | null): string {
  if (value === null || value === undefined) return "--";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  return num.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

export function formatCompactNumber(value: number | string | null): string {
  if (value === null || value === undefined) return "--";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (absNum >= 1e12) return sign + (absNum / 1e12).toFixed(2) + "T";
  if (absNum >= 1e9) return sign + (absNum / 1e9).toFixed(2) + "B";
  if (absNum >= 1e6) return sign + (absNum / 1e6).toFixed(2) + "M";
  if (absNum >= 1e3) return sign + (absNum / 1e3).toFixed(2) + "K";
  return sign + absNum.toFixed(2);
}

export function formatPercentage(value: number | string | null): string {
  if (value === null || value === undefined) return "--";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  return num.toFixed(2) + "%";
}

export function extractOverviewMetrics(profitLoss: FinancialData, year: string) {
  return {
    sales: findMetricValue(profitLoss, year, "Sales"),
    netProfit: findMetricValue(profitLoss, year, "Net Profit"),
    opm: findMetricValue(profitLoss, year, "OPM%"),
    npm: findMetricValue(profitLoss, year, "NPM%"),
    eps: findMetricValue(profitLoss, year, "EPS (Adjusted)"),
    bookValue: findMetricValue(profitLoss, year, "Book Value (Adjusted)"),
  };
}
