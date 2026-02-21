const fetch = require('node-fetch');

async function check() {
  try {
    const res = await fetch("https://api.unfluke.in/api/historicalChart/getOptionNames?id=default");
    const data = await res.json();
    console.log("Opt names:", data.slice(0, 3));
    
    const res2 = await fetch("https://api.unfluke.in/api/option-simulator/getOptionsExpiryDates?optionName=NIFTY&optionType=CE%20-%20Call&id=default");
    const edata = await res2.json();
    console.log("Expiries:", edata?.expiry_date?.slice(0, 3));
    
    const res3 = await fetch(`https://api.unfluke.in/api/historicalChart/gitHistoricOptionsStikePrices?expiryDate=${edata?.expiry_date[0]}&optionName=NIFTY&optionType=CE - Call&id=default`);
    const sdata = await res3.json();
    console.log("Strikes:", sdata?.strike_price?.slice(0, 3));
    
    const url = `https://api.unfluke.in/api/historicalChart/getHistoricOptionsResults?chartType=Options Chart&optionName=NIFTY&id=default&expiryDate=${edata?.expiry_date[0]}&optionType=CE - Call&strikePrice=${sdata?.strike_price[0]}`;
    console.log(url);
    const res4 = await fetch(url.replace(/ /g, '%20'));
    const cdata = await res4.json();
    console.log("Chart Data:", typeof cdata);
    if(cdata) {
        console.log("Keys:", Object.keys(cdata));
        if(cdata.option) console.log("Option:", cdata.option);
        if(cdata.data && Array.isArray(cdata.data)) console.log("Data len:", cdata.data.length, "First:", cdata.data[0]);
    }
  } catch(e) {
    console.error(e);
  }
}
check();
