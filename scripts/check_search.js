const BASE = 'https://api.unfluke.in/api';

async function test(url, label) {
    console.log(`\n--- ${label} ---`);
    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text.slice(0, 500)}`);
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

async function run() {
    // Test ZOMATO exact
    await test(`${BASE}/historicData/getCapcodeByStockSymbol?instrument=ZOMATO`, 'ZOMATO exact');
    await test(`${BASE}/historicData/getCapcodeByStockSymbol?instrument=Zomato`, 'Zomato mixed case');

    // Test TATA (likely partial)
    await test(`${BASE}/historicData/getCapcodeByStockSymbol?instrument=TATA`, 'TATA exact');

    // Test TATA MOTORS
    await test(`${BASE}/historicData/getCapcodeByStockSymbol?instrument=TATAMOTORS`, 'TATAMOTORS');

    // Try to find a search endpoint?
    // Common patterns
    await test(`https://api.unfluke.in/api/historicData/search?query=zoma`, 'Search query=zoma');
    await test(`https://api.unfluke.in/api/historicData/symbolsearch?symbol=zoma`, 'Search symbol=zoma');
}

run();
