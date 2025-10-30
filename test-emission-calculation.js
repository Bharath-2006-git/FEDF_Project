// Test emission calculation endpoint
const API_URL = 'http://localhost:3000/api';

// Test data
const testEmissions = [
  // Electricity
  { category: 'electricity', quantity: 100, unit: 'kWh', subcategory: null, expected: 50 },
  { category: 'electricity', quantity: 1, unit: 'MWh', subcategory: null, expected: 500 },
  
  // Travel - with subcategories
  { category: 'travel', subcategory: 'car', quantity: 100, unit: 'km', expected: 21 },
  { category: 'travel', subcategory: 'bus', quantity: 100, unit: 'km', expected: 5 },
  { category: 'travel', subcategory: 'train', quantity: 100, unit: 'km', expected: 4 },
  { category: 'travel', subcategory: 'plane', quantity: 100, unit: 'km', expected: 25 },
  { category: 'travel', subcategory: 'bike', quantity: 100, unit: 'km', expected: 0 },
  { category: 'travel', subcategory: 'plane', quantity: 2, unit: 'hours', expected: 180 },
  
  // Fuel - with subcategories
  { category: 'fuel', subcategory: 'gasoline', quantity: 10, unit: 'liters', expected: 23.1 },
  { category: 'fuel', subcategory: 'diesel', quantity: 10, unit: 'liters', expected: 26.8 },
  { category: 'fuel', subcategory: 'natural_gas', quantity: 5, unit: 'cubic meters', expected: 10 },
  
  // Waste - with subcategories
  { category: 'waste', subcategory: 'household', quantity: 10, unit: 'kg', expected: 5 },
  { category: 'waste', subcategory: 'recyclable', quantity: 10, unit: 'kg', expected: 1 },
  { category: 'waste', subcategory: 'organic', quantity: 10, unit: 'kg', expected: 3 },
  { category: 'waste', subcategory: 'electronic', quantity: 5, unit: 'kg', expected: 7.5 },
];

async function testCalculations() {
  console.log('🧪 Testing Emission Calculations\n');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testEmissions) {
    const url = `${API_URL}/emissions/calculate?category=${test.category}&quantity=${test.quantity}&unit=${test.unit}${test.subcategory ? `&subcategory=${test.subcategory}` : ''}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const actual = data.co2Emissions;
      const match = Math.abs(actual - test.expected) < 0.01;
      
      if (match) {
        console.log(`✅ PASS: ${test.category}${test.subcategory ? `/${test.subcategory}` : ''} - ${test.quantity} ${test.unit}`);
        console.log(`   Expected: ${test.expected} kg, Got: ${actual} kg\n`);
        passed++;
      } else {
        console.log(`❌ FAIL: ${test.category}${test.subcategory ? `/${test.subcategory}` : ''} - ${test.quantity} ${test.unit}`);
        console.log(`   Expected: ${test.expected} kg, Got: ${actual} kg\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.category} - ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('='.repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testEmissions.length} tests`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the emission factors in routes.ts');
  }
}

// Run tests
testCalculations().catch(console.error);
