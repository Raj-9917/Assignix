import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    let dbStatus = 'unconfigured'
    let dbLatencyMs = 0

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })

      const queryStart = Date.now()
      // Perform a lightweight database query to keep the PostgreSQL instance warm and active
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      dbLatencyMs = Date.now() - queryStart

      if (error && error.code !== 'PGRST116') {
        dbStatus = `query_warning: ${error.message}`
      } else {
        dbStatus = 'connected'
      }
    }

    const totalLatencyMs = Date.now() - startTime

    const responseBody = {
      status: 'healthy',
      message: 'Supabase instance is active and keep-alive ping succeeded.',
      timestamp: new Date().toISOString(),
      serverTimeUnix: Math.floor(Date.now() / 1000),
      database: dbStatus,
      latency: {
        databaseMs: dbLatencyMs,
        totalMs: totalLatencyMs,
      },
      environment: {
        denoVersion: Deno.version.deno,
      },
    }

    return new Response(JSON.stringify(responseBody, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown server error'
    return new Response(
      JSON.stringify(
        {
          status: 'error',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
