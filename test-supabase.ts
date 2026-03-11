import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  // Test 1: Read
  const { data: readData, error: readError } = await supabase.from('users').select('id').limit(1);
  if (readError) {
    console.error('Read test failed:', readError.message);
  } else {
    console.log('Read test successful. Found', readData.length, 'users.');
  }

  // Test 2: Insert
  const testUsername = `test_user_${Date.now()}`;
  console.log(`Attempting to insert test user: ${testUsername}`);
  const { data: insertData, error: insertError } = await supabase
    .from('users')
    .insert([{ username: testUsername, password: 'password123', role: 'user' }])
    .select();
  
  if (insertError) {
    console.error('Insert test failed:', insertError.message);
    if (insertError.message.includes('RLS')) {
      console.log('HINT: Row Level Security (RLS) is likely enabled and blocking the insert.');
    }
  } else {
    console.log('Insert test successful. Created user with ID:', insertData[0].id);
    
    // Test 3: Delete
    const { error: deleteError } = await supabase.from('users').delete().eq('id', insertData[0].id);
    if (deleteError) {
      console.error('Delete test failed:', deleteError.message);
    } else {
      console.log('Delete test successful.');
    }
  }
}

testSupabase();
