/**
 * Final attempt to create advanced tables by calling our API endpoint
 * This uses the existing temporary admin routes to create tables
 */

async function createAdvancedTablesViaAPI() {
  console.log('🚀 Creating advanced tables via API endpoint...');
  
  // First, check what tables exist
  console.log('Checking existing tables...');
  const testResponse = await fetch('http://localhost:5000/api/temp-admin/test-advanced-tables');
  const testData = await testResponse.json();
  
  console.log('Tables status:');
  testData.results.forEach(result => {
    console.log(`  ${result.table}: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
  });
  
  // Try to create tables via API
  console.log('\nAttempting to create tables via API...');
  const createResponse = await fetch('http://localhost:5000/api/temp-admin/create-advanced-tables', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  
  const createData = await createResponse.json();
  console.log('Create response:', createData);
  
  // Check again after creation attempt
  console.log('\nChecking tables after creation attempt...');
  const testResponse2 = await fetch('http://localhost:5000/api/temp-admin/test-advanced-tables');
  const testData2 = await testResponse2.json();
  
  console.log('Tables status after creation:');
  testData2.results.forEach(result => {
    console.log(`  ${result.table}: ${result.exists ? '✅ EXISTS' : '❌ MISSING'}`);
  });
  
  // Try to directly query the Supabase tables that might exist
  console.log('\nTesting direct API queries...');
  const directTests = [
    'reading_goals',
    'performance_metrics', 
    'user_notifications'
  ];
  
  for (const table of directTests) {
    try {
      const response = await fetch(`http://localhost:5000/api/${table}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${table} API working - ${data.length || 0} records`);
      } else {
        console.log(`❌ ${table} API failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${table} API error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Advanced tables creation attempt completed!');
}

// Run the script
createAdvancedTablesViaAPI().catch(console.error);