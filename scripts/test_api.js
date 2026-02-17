const BASE = 'https://api.unfluke.in/api';
const capcode = 476; // RELIANCE

async function run() {
    const endpoints = [
        ['Balance Sheet', `${BASE}/screener/getBalanceSheet?capcode=${capcode}&type=C`],
        ['Profit Loss', `${BASE}/screener/getProfitLoss?capcode=${capcode}&type=C`],
        ['Cash Flow', `${BASE}/screener/getCashFlow?capcode=${capcode}&type=C`],
        ['Quarterly', `${BASE}/screener/getQuarterly?capcode=${capcode}&type=C`],
        ['KeyFinancial', `${BASE}/screener/getCFRatio?capcode=${capcode}&type=C&section=KeyFinancial`],
    ];

    for (const [label, url] of endpoints) {
        const res = await fetch(url);
        const data = await res.json();
        const keys = Object.keys(data.results || {}).sort();
        console.log(`\n${label} period keys (${keys.length}): ${keys.join(', ')}`);
        // Show headings
        if (data.headings) {
            console.log(`  Headings: ${data.headings.map(h => h.title).join(' | ')}`);
        }
    }
}

run();
