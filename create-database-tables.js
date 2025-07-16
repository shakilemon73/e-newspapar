/**
 * Simple script to call the database creation API and display the SQL
 */

import axios from 'axios';

async function createDatabaseTables() {
  try {
    console.log('🚀 Getting database creation script...');
    
    const response = await axios.post('http://localhost:5000/api/admin/create-user-dashboard-tables', {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-admin-token'
      }
    });

    const data = response.data;
    
    console.log('✅ Database creation check completed!');
    console.log('\n📊 Table Status:');
    Object.entries(data.results.tables).forEach(([table, status]) => {
      console.log(`  ${table}: ${status}`);
    });
    
    console.log(`\n🏆 Achievements: ${data.results.achievements}`);
    
    console.log('\n📝 SQL Script to run in Supabase SQL Editor:');
    console.log('=' .repeat(80));
    console.log(data.sqlScript);
    console.log('=' .repeat(80));
    
    console.log('\n📋 Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL script above');
    console.log('4. Run the script to create all tables');
    console.log('5. All user dashboard features will work immediately');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createDatabaseTables();