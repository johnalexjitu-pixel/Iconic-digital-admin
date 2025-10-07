// Test script to verify iconicdigital.com API connection
// Run: node test-iconicdigital-api.js

console.log('🔍 Testing iconicdigital.com API Connection...\n');

const BASE_URL = 'https://iconicdigital.com/api';

async function testAPI(endpoint, description) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`URL: ${BASE_URL}${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success! Status: ${response.status}`);
      console.log(`Data preview:`, JSON.stringify(data, null, 2).substring(0, 200), '...\n');
      return { success: true, data };
    } else {
      console.log(`❌ Failed! Status: ${response.status}`);
      console.log(`Error:`, data, '\n');
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('=' .repeat(60));
  console.log('ICONICDIGITAL.COM API TESTS');
  console.log('=' .repeat(60), '\n');
  
  // Test 1: Status/Health
  await testAPI('/status', 'API Status Check');
  
  // Test 2: Users
  await testAPI('/users?limit=5', 'Get Users (5 items)');
  
  // Test 3: Campaigns
  await testAPI('/campaigns?limit=5', 'Get Campaigns (5 items)');
  
  // Test 4: Transactions
  await testAPI('/transactions?limit=5', 'Get Transactions (5 items)');
  
  console.log('=' .repeat(60));
  console.log('TEST COMPLETED');
  console.log('=' .repeat(60), '\n');
  
  console.log('📝 Next Steps:');
  console.log('1. If all tests passed, restart your backend server');
  console.log('2. Backend will automatically fetch data from iconicdigital.com');
  console.log('3. Refresh your Admin Panel User Management page');
  console.log('4. You should see real users from iconicdigital.com!\n');
}

runTests();

