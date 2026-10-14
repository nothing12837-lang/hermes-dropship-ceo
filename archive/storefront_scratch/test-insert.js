const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qdkkxpfhwrwyoardlceo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFka2t4cGZod3J3eW9hcmRsY2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4Njc2OTcsImV4cCI6MjEwNjQ0MzY5N30.qFvuYQ1G9NvYGYXWVtR6b9dPScOuUIfeVQ8yX3y1DJo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('products').insert([
    {
      id: 'mock-test-1',
      title: 'Mock Product',
      description: 'A mock product',
      price: 9.99,
      image_url: 'https://via.placeholder.com/300',
      category: 'general',
      active: true,
      slug: 'mock-test-1',
      is_trending: false,
      is_new: true,
    }
  ]);
  console.log('Result:', data, error);
}

testInsert();
