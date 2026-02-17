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
    await test(`${BASE}/historicData/search?searchQuery=zomato`, 'Search query=zomato');
    await test(`${BASE}/historicData/search?searchQuery=tata`, 'Search query=tata');
}

run();
