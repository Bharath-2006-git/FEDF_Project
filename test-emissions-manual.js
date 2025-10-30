// Manual test for emission endpoints
// This script tests:
// 1. GET /api/emissions/categories - Get metadata
// 2. POST /api/emissions/add - Log emissions with subcategories
// 3. GET /api/emissions/history - Retrieve logged emissions

const API_URL = 'http://localhost:3000/api';

// You need to provide a valid token from a logged-in user
// To get a token, login through the UI and check localStorage or network tab
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.log('❌ Usage: node test-emissions-manual.js <your-jwt-token>');
  console.log('\nTo get your token:');
  console.log('1. Login to the app at http://localhost:5173/auth');
  console.log('2. Open browser DevTools -> Application/Storage -> Local Storage');
  console.log('3. Copy the value of the "token" key');
  console.log('4. Run: node test-emissions-manual.js YOUR_TOKEN_HERE\n');
  process.exit(1);
}

async function testEmissionsAPI() {
  console.log('🧪 Testing Emissions API\n');
  console.log('='.repeat(80));

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  };

  try {
    // Test 1: Get categories metadata
    console.log('\n1️⃣  Testing GET /api/emissions/categories\n');
    const categoriesResponse = await fetch(`${API_URL}/emissions/categories`, { headers });
    
    if (!categoriesResponse.ok) {
      throw new Error(`Categories request failed: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
    }
    
    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories metadata retrieved successfully');
    console.log(`   Found ${Object.keys(categoriesData.categories).length} main categories:`);
    
    for (const [category, info] of Object.entries(categoriesData.categories)) {
      const subcategoryCount = info.subcategories ? Object.keys(info.subcategories).length : 0;
      console.log(`   - ${category}: ${subcategoryCount} subcategories, units: ${info.units.join(', ')}`);
    }

    // Test 2: Add various emissions with subcategories
    console.log('\n2️⃣  Testing POST /api/emissions/add\n');
    
    const testEmissions = [
      {
        category: 'travel',
        subcategory: 'car_electric',
        quantity: 50,
        unit: 'km',
        date: new Date().toISOString(),
        description: 'Daily commute in electric car'
      },
      {
        category: 'travel',
        subcategory: 'plane_business',
        quantity: 500,
        unit: 'km',
        date: new Date().toISOString(),
        description: 'Business trip to conference'
      },
      {
        category: 'fuel',
        subcategory: 'natural_gas',
        quantity: 15,
        unit: 'cubic_meters',
        date: new Date().toISOString(),
        description: 'Monthly natural gas usage'
      },
      {
        category: 'waste',
        subcategory: 'recyclable',
        quantity: 25,
        unit: 'kg',
        date: new Date().toISOString(),
        description: 'Recyclable waste collection'
      },
      {
        category: 'production',
        subcategory: 'beef',
        quantity: 2,
        unit: 'kg',
        date: new Date().toISOString(),
        description: 'Beef consumption'
      }
    ];

    const addedEmissions = [];

    for (const emission of testEmissions) {
      const response = await fetch(`${API_URL}/emissions/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify(emission)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add emission: ${errorData.message}`);
      }

      const data = await response.json();
      addedEmissions.push(data);
      
      console.log(`✅ Added: ${emission.category}/${emission.subcategory} - ${emission.quantity} ${emission.unit}`);
      console.log(`   CO2 Emissions: ${data.co2Emissions} kg CO2`);
      console.log(`   Description: ${emission.description}`);
    }

    // Test 3: Get emissions history
    console.log('\n3️⃣  Testing GET /api/emissions/history\n');
    
    const historyResponse = await fetch(`${API_URL}/emissions/history`, { headers });
    
    if (!historyResponse.ok) {
      throw new Error(`History request failed: ${historyResponse.status} ${historyResponse.statusText}`);
    }
    
    const historyData = await historyResponse.json();
    console.log('✅ Emissions history retrieved successfully');
    console.log(`   Total emissions found: ${historyData.emissions?.length || 0}`);
    
    if (historyData.emissions && historyData.emissions.length > 0) {
      console.log('\n   Recent emissions:');
      historyData.emissions.slice(0, 5).forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.category}${e.subcategory ? `/${e.subcategory}` : ''} - ${e.quantity} ${e.unit} = ${e.co2Emissions} kg CO2`);
      });
    }

    // Test 4: Calculate emissions without logging
    console.log('\n4️⃣  Testing GET /api/emissions/calculate\n');
    
    const calculateTests = [
      { category: 'travel', subcategory: 'car_small', quantity: 100, unit: 'km' },
      { category: 'electricity', subcategory: 'renewable', quantity: 50, unit: 'kWh' },
      { category: 'waste', subcategory: 'electronic', quantity: 10, unit: 'kg' }
    ];

    for (const test of calculateTests) {
      const url = `${API_URL}/emissions/calculate?category=${test.category}&subcategory=${test.subcategory}&quantity=${test.quantity}&unit=${test.unit}`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Calculate request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ ${test.category}/${test.subcategory}: ${test.quantity} ${test.unit} = ${data.co2Emissions} kg CO2`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testEmissionsAPI();
