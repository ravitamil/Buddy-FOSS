import {serve} from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The legacy group ledger cannot prove that a caller is currently owed the
// requested amount. Keep delivery unavailable until the reconciled backend can
// derive the debtor, creditor, amount, and group display name from persisted,
// authorization-checked state.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }

  return new Response(
    JSON.stringify({
      sent: false,
      reason:
        'Payment reminders are temporarily unavailable while group authorization is upgraded.',
    }),
    {
      status: 503,
      headers: {...corsHeaders, 'Content-Type': 'application/json'},
    },
  );
});
