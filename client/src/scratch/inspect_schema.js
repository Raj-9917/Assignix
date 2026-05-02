import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function inspect() {
  console.log('--- Inspecting Current User & Data ---');
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current User Auth:', user ? { id: user.id, email: user.email } : 'Not logged in');

  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    console.log('Database Role:', profile?.role);
  }

  const { data: courses } = await supabase.from('courses').select('id, title');
  console.log('Courses Count:', courses?.length);
  console.log('Courses:', courses);

  const { data: problems } = await supabase.from('problems').select('id, title').limit(5);
  console.log('Problems Sample:', problems);
}

inspect()
