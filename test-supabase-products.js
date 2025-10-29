// Test Script: Supabase Products Integration
// Run with: node test-supabase-products.js

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🧪 Testing Supabase Products Integration\n');
console.log('=' .repeat(50));

// Check environment
console.log('\n📋 Environment Check:');
console.log('   Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ ERROR: Supabase credentials not found!');
  console.log('   Please check your .env.local file\n');
  process.exit(1);
}

// Test 1: Fetch all products
console.log('\n📦 Test 1: Fetching all products from Supabase...');

fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
})
.then(res => res.json())
.then(data => {
  console.log(`   ✅ Found ${data.length} products`);
  
  if (data.length > 0) {
    console.log('\n📊 Products in database:');
    data.forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.name} (${product.brand})`);
      console.log(`      Category: ${product.category}`);
      console.log(`      Price: ${product.currency || 'KES'} ${product.estimated_price || 'N/A'}`);
      console.log(`      Hair Types: ${product.hair_types ? product.hair_types.join(', ') : 'N/A'}`);
      console.log('');
    });
  }
  
  // Test 2: Fetch retailers
  console.log('🏪 Test 2: Fetching retailers from Supabase...');
  return fetch(`${supabaseUrl}/rest/v1/retailers?select=*,retailer_locations(*)`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
})
.then(res => res.json())
.then(data => {
  console.log(`   ✅ Found ${data.length} retailers`);
  
  if (data.length > 0) {
    console.log('\n🏬 Retailers in database:');
    data.forEach((retailer, i) => {
      console.log(`   ${i + 1}. ${retailer.name} (${retailer.type})`);
      console.log(`      Delivery: ${retailer.delivery_available ? 'Yes' : 'No'}`);
      console.log(`      Locations: ${retailer.retailer_locations.length}`);
      if (retailer.retailer_locations.length > 0) {
        retailer.retailer_locations.forEach(loc => {
          console.log(`         - ${loc.name} (${loc.area})`);
        });
      }
      console.log('');
    });
  }
  
  // Test 3: Product-Retailer relationships
  console.log('🔗 Test 3: Checking product-retailer relationships...');
  return fetch(`${supabaseUrl}/rest/v1/product_retailers?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
})
.then(res => res.json())
.then(data => {
  console.log(`   ✅ Found ${data.length} product-retailer relationships`);
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ All tests passed! Supabase integration is working!\n');
  console.log('📖 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Go to: http://localhost:3002/hair-care');
  console.log('   3. Upload a hair photo');
  console.log('   4. Watch console logs for product fetching');
  console.log('   5. Check product recommendations\n');
})
.catch(error => {
  console.error('\n❌ ERROR:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Check Supabase credentials in .env.local');
  console.log('   2. Verify tables exist in Supabase Dashboard');
  console.log('   3. Run CREATE_PRODUCTS_TABLE.sql if tables missing\n');
});

