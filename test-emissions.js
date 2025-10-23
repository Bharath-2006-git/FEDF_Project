/**
 * Comprehensive Test Script for CarbonSense Emission Operations
 * Tests all emission logging, calculation, and retrieval endpoints
 */

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testUserId = null;
let createdEmissionIds = [];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 1: User Login
async function testLogin() {
  log('\n🔐 Test 1: User Login', 'blue');
  
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'demo@carbonsense.com',
      password: 'demo123',
    }),
  });

  if (result.success) {
    authToken = result.data.token;
    testUserId = result.data.user.id;
    log(`✅ Login successful! User ID: ${testUserId}`, 'green');
    return true;
  } else {
    log(`❌ Login failed: ${result.error}`, 'red');
    return false;
  }
}

// Test 2: Calculate Emissions (without saving)
async function testCalculateEmissions() {
  log('\n🧮 Test 2: Calculate Emissions', 'blue');
  
  const testCases = [
    { category: 'electricity', quantity: 100, unit: 'kWh', subcategory: null },
    { category: 'travel', quantity: 50, unit: 'km', subcategory: 'car' },
    { category: 'travel', quantity: 50, unit: 'km', subcategory: 'bus' },
    { category: 'fuel', quantity: 10, unit: 'liters', subcategory: 'gasoline' },
    { category: 'waste', quantity: 5, unit: 'kg', subcategory: 'household' },
  ];

  let passed = 0;
  for (const test of testCases) {
    const params = new URLSearchParams({
      category: test.category,
      quantity: test.quantity,
      unit: test.unit,
      ...(test.subcategory && { subcategory: test.subcategory }),
    });

    const result = await makeRequest(`/emissions/calculate?${params}`);
    
    if (result.success) {
      log(`  ✓ ${test.quantity}${test.unit} of ${test.category}${test.subcategory ? `/${test.subcategory}` : ''} = ${result.data.co2Emissions} kg CO₂`, 'green');
      passed++;
    } else {
      log(`  ✗ Failed to calculate: ${result.error}`, 'red');
    }
  }

  log(`\n${passed}/${testCases.length} calculations passed`, passed === testCases.length ? 'green' : 'yellow');
  return passed === testCases.length;
}

// Test 3: Add Emission Entries
async function testAddEmissions() {
  log('\n📊 Test 3: Add Emission Entries', 'blue');
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const emissions = [
    {
      category: 'electricity',
      quantity: 150,
      unit: 'kWh',
      date: today,
      description: 'Home electricity usage',
    },
    {
      category: 'travel',
      subcategory: 'car',
      quantity: 30,
      unit: 'km',
      date: today,
      description: 'Daily commute',
    },
    {
      category: 'fuel',
      subcategory: 'gasoline',
      quantity: 25,
      unit: 'liters',
      date: yesterday,
      description: 'Car refuel',
    },
    {
      category: 'waste',
      subcategory: 'household',
      quantity: 3,
      unit: 'kg',
      date: today,
      description: 'Daily waste',
    },
  ];

  let passed = 0;
  for (const emission of emissions) {
    const result = await makeRequest('/emissions/add', {
      method: 'POST',
      body: JSON.stringify(emission),
    });

    if (result.success) {
      createdEmissionIds.push(result.data.emission.id);
      log(`  ✓ Added ${emission.quantity}${emission.unit} of ${emission.category} - ${result.data.co2Emissions} kg CO₂`, 'green');
      passed++;
    } else {
      log(`  ✗ Failed to add emission: ${result.error}`, 'red');
    }
  }

  log(`\n${passed}/${emissions.length} emissions added`, passed === emissions.length ? 'green' : 'yellow');
  return passed === emissions.length;
}

// Test 4: Get Emissions List
async function testGetEmissionsList() {
  log('\n📋 Test 4: Get Emissions List', 'blue');
  
  const result = await makeRequest('/emissions/list');
  
  if (result.success) {
    const emissions = result.data.emissions || [];
    log(`  ✓ Retrieved ${emissions.length} emissions`, 'green');
    log(`  Total CO₂: ${result.data.totalEmissions} kg`, 'cyan');
    
    if (emissions.length > 0) {
      log('\n  Latest 3 emissions:', 'cyan');
      emissions.slice(0, 3).forEach(e => {
        log(`    - ${e.category}: ${e.quantity}${e.unit} = ${e.co2Emissions} kg CO₂`, 'cyan');
      });
    }
    return true;
  } else {
    log(`  ✗ Failed to get emissions list: ${result.error}`, 'red');
    return false;
  }
}

// Test 5: Get Emissions History
async function testGetEmissionsHistory() {
  log('\n📜 Test 5: Get Emissions History', 'blue');
  
  const result = await makeRequest('/emissions/history');
  
  if (result.success) {
    const history = result.data.history || [];
    log(`  ✓ Retrieved ${history.length} months of history`, 'green');
    log(`  Total emissions: ${result.data.totalEmissions} kg CO₂`, 'cyan');
    
    if (history.length > 0) {
      log('\n  Monthly breakdown:', 'cyan');
      history.forEach(h => {
        log(`    ${h.date}: ${h.emissions} kg CO₂`, 'cyan');
      });
    }
    return true;
  } else {
    log(`  ✗ Failed to get emissions history: ${result.error}`, 'red');
    return false;
  }
}

// Test 6: Get Emissions Summary
async function testGetEmissionsSummary() {
  log('\n📊 Test 6: Get Emissions Summary', 'blue');
  
  const result = await makeRequest('/emissions/summary');
  
  if (result.success) {
    const summary = result.data;
    log(`  ✓ Total Emissions: ${summary.totalEmissions} kg CO₂`, 'green');
    log(`  ✓ Total Entries: ${summary.totalEntries}`, 'green');
    log(`  ✓ Average Daily: ${summary.averageDaily} kg CO₂`, 'green');
    log(`  ✓ Unique Days Tracked: ${summary.uniqueDays}`, 'green');
    
    if (summary.byCategory) {
      log('\n  By Category:', 'cyan');
      Object.entries(summary.byCategory).forEach(([cat, val]) => {
        log(`    ${cat}: ${val} kg CO₂`, 'cyan');
      });
    }
    
    if (summary.highestDay) {
      log(`\n  Highest Day: ${summary.highestDay.date} - ${summary.highestDay.value} kg CO₂`, 'yellow');
    }
    
    if (summary.lowestDay) {
      log(`  Lowest Day: ${summary.lowestDay.date} - ${summary.lowestDay.value} kg CO₂`, 'yellow');
    }
    
    return true;
  } else {
    log(`  ✗ Failed to get emissions summary: ${result.error}`, 'red');
    return false;
  }
}

// Test 7: Filter Emissions by Category
async function testFilterByCategory() {
  log('\n🔍 Test 7: Filter Emissions by Category', 'blue');
  
  const categories = ['electricity', 'travel', 'fuel', 'waste'];
  let passed = 0;
  
  for (const category of categories) {
    const result = await makeRequest(`/emissions/list?category=${category}`);
    
    if (result.success) {
      const emissions = result.data.emissions || [];
      log(`  ✓ ${category}: ${emissions.length} entries (${result.data.totalEmissions} kg CO₂)`, 'green');
      passed++;
    } else {
      log(`  ✗ Failed to filter ${category}: ${result.error}`, 'red');
    }
  }
  
  log(`\n${passed}/${categories.length} category filters passed`, passed === categories.length ? 'green' : 'yellow');
  return passed === categories.length;
}

// Test 8: Update Emission
async function testUpdateEmission() {
  log('\n✏️ Test 8: Update Emission Entry', 'blue');
  
  if (createdEmissionIds.length === 0) {
    log('  ⚠️ No emissions to update', 'yellow');
    return true;
  }
  
  const emissionId = createdEmissionIds[0];
  const updateData = {
    category: 'electricity',
    quantity: 200,
    unit: 'kWh',
    date: new Date().toISOString().split('T')[0],
    description: 'Updated home electricity usage',
  };
  
  const result = await makeRequest(`/emissions/${emissionId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  
  if (result.success) {
    log(`  ✓ Emission ${emissionId} updated successfully`, 'green');
    log(`  New CO₂: ${result.data.emission.co2Emissions} kg`, 'cyan');
    return true;
  } else {
    log(`  ✗ Failed to update emission: ${result.error}`, 'red');
    return false;
  }
}

// Test 9: Delete Emission
async function testDeleteEmission() {
  log('\n🗑️ Test 9: Delete Emission Entry', 'blue');
  
  if (createdEmissionIds.length < 2) {
    log('  ⚠️ Not enough emissions to delete', 'yellow');
    return true;
  }
  
  const emissionId = createdEmissionIds[createdEmissionIds.length - 1];
  
  const result = await makeRequest(`/emissions/${emissionId}`, {
    method: 'DELETE',
  });
  
  if (result.success) {
    log(`  ✓ Emission ${emissionId} deleted successfully`, 'green');
    createdEmissionIds.pop();
    return true;
  } else {
    log(`  ✗ Failed to delete emission: ${result.error}`, 'red');
    return false;
  }
}

// Test 10: Edge Cases and Validation
async function testValidation() {
  log('\n🛡️ Test 10: Validation and Edge Cases', 'blue');
  
  const invalidCases = [
    {
      name: 'Missing required fields',
      data: { category: 'electricity' },
      shouldFail: true,
    },
    {
      name: 'Negative quantity',
      data: { category: 'electricity', quantity: -10, unit: 'kWh', date: new Date().toISOString().split('T')[0] },
      shouldFail: true,
    },
    {
      name: 'Zero quantity',
      data: { category: 'electricity', quantity: 0, unit: 'kWh', date: new Date().toISOString().split('T')[0] },
      shouldFail: true,
    },
  ];
  
  let passed = 0;
  for (const test of invalidCases) {
    const result = await makeRequest('/emissions/add', {
      method: 'POST',
      body: JSON.stringify(test.data),
    });
    
    if (test.shouldFail && !result.success) {
      log(`  ✓ ${test.name}: Correctly rejected`, 'green');
      passed++;
    } else if (!test.shouldFail && result.success) {
      log(`  ✓ ${test.name}: Correctly accepted`, 'green');
      passed++;
    } else {
      log(`  ✗ ${test.name}: Unexpected result`, 'red');
    }
  }
  
  log(`\n${passed}/${invalidCases.length} validation tests passed`, passed === invalidCases.length ? 'green' : 'yellow');
  return passed === invalidCases.length;
}

// Main test runner
async function runAllTests() {
  log('='.repeat(60), 'cyan');
  log('🧪 CarbonSense Emission Operations Test Suite', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Calculate Emissions', fn: testCalculateEmissions },
    { name: 'Add Emissions', fn: testAddEmissions },
    { name: 'Get Emissions List', fn: testGetEmissionsList },
    { name: 'Get Emissions History', fn: testGetEmissionsHistory },
    { name: 'Get Emissions Summary', fn: testGetEmissionsSummary },
    { name: 'Filter by Category', fn: testFilterByCategory },
    { name: 'Update Emission', fn: testUpdateEmission },
    { name: 'Delete Emission', fn: testDeleteEmission },
    { name: 'Validation Tests', fn: testValidation },
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Test Results Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
    results.failed === 0 ? 'green' : 'yellow');
  log('='.repeat(60), 'cyan');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Emission operations are working perfectly!', 'green');
  } else {
    log(`\n⚠️ ${results.failed} test(s) failed. Please review the errors above.`, 'yellow');
  }
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
