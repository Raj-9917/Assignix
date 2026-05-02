import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJoin() {
  console.log('Testing challenge joining (INSERT into challenge_participants)...');
  
  // Get a challenge and user to test with
  const { data: challenge } = await supabase.from('challenges').select('id').limit(1).single();
  const { data: user } = await supabase.from('users').select('id').limit(1).single();

  if (!challenge || !user) {
    console.error('Could not find challenge or user to test with');
    return;
  }

  console.log(`Using Challenge ID: ${challenge.id}`);
  console.log(`Using User ID: ${user.id}`);

  // Try to insert (this mimics joinChallenge)
  const { data, error } = await supabase
    .from('challenge_participants')
    .upsert({
      challenge_id: challenge.id,
      user_id: user.id
    }, { onConflict: 'challenge_id, user_id' })
    .select();

  if (error) {
    console.error('JOIN ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('JOIN SUCCESS:', JSON.stringify(data, null, 2));
  }
}

testJoin();
