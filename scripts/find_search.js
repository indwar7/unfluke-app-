const BASE = 'https://api.unfluke.in/api';

async function test(url, label) {
    console.log(`\n--- ${label} ---`);
    try {
        const res = await fetch(url);
        if (res.status === 404) {
            console.log('Status: 404 Not Found');
            return;
        }
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text.slice(0, 300)}`);
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

async function run() {
    // Test search endpoints
    await test(`${BASE}/search/search_company_by_name?search=zomato`, 'Search company by name - zomato');
    await test(`${BASE}/historicData/search?symbol=zoma`, 'historicData/search');

    // Test master lists
    await test(`${BASE}/historicData/stockList`, 'stockList');
    await test(`${BASE}/screener/companyList`, 'companyList');

    // Maybe "symbol" endpoint
    await test(`${BASE}/historicData/getCapcodeByStockSymbol?instrument=ZOMATO`, 'ZOMATO exact check again');
    await test(`${BASE}/historicData/getCapcodeByStockSymbol?instrument=PAYTM`, 'PAYTM check');
}

run();
