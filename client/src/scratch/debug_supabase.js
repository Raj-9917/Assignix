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

async function debug() {
  console.log('--- Testing Supabase Connection ---')
  
  console.log('\n1. Testing "problems" table...')
  const { data: probData, error: probError } = await supabase.from('problems').select('*').limit(1)
  if (probError) {
    console.error('Problems Table Error:', probError.message)
    console.error('Error Code:', probError.code)
    console.error('Error Details:', probError.details)
  } else {
    console.log('Problems Table Success! Count:', probData.length)
  }

  console.log('\n2. Testing "users" table...')
  const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1)
  if (userError) {
    console.error('Users Table Error:', userError.message)
  } else {
    console.log('Users Table Success! Count:', userData.length)
  }

  console.log('\n3. Testing "challenges" table...')
  const { data: chalData, error: chalError } = await supabase.from('challenges').select('*').limit(1)
  if (chalError) {
    console.error('Challenges Table Error:', chalError.message)
  } else {
    console.log('Challenges Table Success! Count:', chalData.length)
  }
}

debug()
