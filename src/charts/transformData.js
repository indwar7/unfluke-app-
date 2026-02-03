export const transformFinancialData = (results) => {
  if (!results) return [];

  return Object.keys(results).map((year) => {
    const yearData = results[year];
    const merged = {};

    yearData.forEach(item => {
      Object.assign(merged, item);
    });

    return {
      year: year,
      sales: merged["Sales"] || 0,
      operatingProfit: merged["Operating Profit"] || 0,
      opm: merged["OPM%"] || 0,
      netProfit: merged["Net Profit"] || 0,
      npm: merged["NPM%"] || 0,
      ebitda: merged["EBITDA"] || 0,
      eps: merged["EPS (Adjusted)"] || 0,
      bookValue: merged["Book Value (Adjusted)"] || 0
    };
  });
};
