// Test script to check API connectivity
const axios = require("axios");

const BACKEND_URL = "https://api.unfluke.in";

async function testAPI() {
  console.log("🔍 Testing API connectivity...");
  console.log("Backend URL:", BACKEND_URL);
  console.log("Current time:", new Date().toISOString());

  try {
    // Test basic connectivity with simple endpoint
    console.log("\n1. Testing basic search API...");
    const searchResponse = await axios.get(BACKEND_URL + "/api/historicData/search", {
      params: { company_id: 476 },
      timeout: 10000,
    });
    console.log("✅ Search API is reachable!");
    console.log("Status:", searchResponse.status);
    console.log("Data type:", typeof searchResponse.data);
    console.log("Data length:", Array.isArray(searchResponse.data) ? searchResponse.data.length : "Not array");

    // Test company name API
    console.log("\n2. Testing company name API...");
    const nameResponse = await axios.get(BACKEND_URL + "/api/historicData/companyname", {
      params: { company_id: 476 },
      timeout: 10000,
    });
    console.log("✅ Company name response:", nameResponse.data);

    // Test shareholding data API
    console.log("\n3. Testing shareholding data API...");
    const holdingResponse = await axios.get(BACKEND_URL + "/api/historicData/shareholding", {
      params: { company_id: 476 },
      timeout: 10000,
    });
    console.log("✅ Shareholding response received");
    console.log("Type:", typeof holdingResponse.data);
    console.log("Sample data:", JSON.stringify(holdingResponse.data).substring(0, 200) + "...");

    console.log("\n🎉 All API tests completed successfully!");
  } catch (error) {
    console.error("\n❌ API Test Failed:");
    console.error("Error message:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.response) {
      console.error("HTTP Status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received");
      console.error("Request details:", error.request);
    }
  }
}

console.log("🚀 Starting API connectivity test...");
testAPI()
  .then(() => {
    console.log("✅ Test completed");
  })
  .catch((err) => {
    console.error("💥 Test script error:", err);
  });
