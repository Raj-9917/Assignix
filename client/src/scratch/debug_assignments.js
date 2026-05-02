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
  console.log('--- Testing Assignments Columns ---')
  
  const tests = ['problem_ids', 'problemIds', 'due_date', 'dueDate']
  
  for (const col of tests) {
    const { error } = await supabase.from('assignments').select(col).limit(1)
    if (error) {
      console.log(`Column '${col}': MISSING (${error.message})`)
    } else {
      console.log(`Column '${col}': EXISTS`)
    }
  }
}

debug()
