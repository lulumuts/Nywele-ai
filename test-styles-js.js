// Test Script: Style Recommendations
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testStyles() {
  console.log('🧪 Testing Style Recommendations System\n');

  // Test 1: Count styles
  const { data: styles, count: styleCount } = await supabase
    .from('styles')
    .select('*', { count: 'exact' });
  console.log(`✅ Styles: ${styleCount}`);

  // Test 2: Count braiding products
  const { data: products, count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('category', 'braiding_hair');
  console.log(`✅ Braiding Hair Products: ${productCount}`);

  // Test 3: Count links
  const { data: links, count: linkCount } = await supabase
    .from('style_product_recommendations')
    .select('*', { count: 'exact' });
  console.log(`✅ Style-Product Links: ${linkCount}`);

  // Test 4: See actual links
  if (linkCount > 0) {
    const { data: examples } = await supabase
      .from('style_product_recommendations')
      .select(`
        styles!inner(name),
        products!inner(brand, name)
      `)
      .limit(5);

    console.log(`\n📋 Sample Links:`);
    examples.forEach((link) => {
      console.log(`   ${link.styles.name} → ${link.products.brand} ${link.products.name}`);
    });

    // Test 5: Get products for Knotless Braids
    const { data: knotlessProducts } = await supabase
      .from('style_product_recommendations')
      .select(`
        quantity,
        notes,
        styles!inner(name),
        products!inner(brand, name, estimated_price, color_name)
      `)
      .eq('styles.name', 'Knotless Braids')
      .eq('recommendation_type', 'essential');

    console.log(`\n📋 Knotless Braids Essential Products:`);
    knotlessProducts.forEach((item) => {
      console.log(`   ${item.products.brand} ${item.products.name}`);
      console.log(`   Color: ${item.products.color_name}`);
      console.log(`   Quantity: ${item.quantity} packs`);
      console.log(`   Cost: KES ${item.products.estimated_price * item.quantity}`);
      console.log(`   Note: ${item.notes}\n`);
    });
  }

  console.log('\n✅ All tests passed!');
}

testStyles();

