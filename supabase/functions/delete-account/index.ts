// @ts-nocheck
import {serve} from 'https://deno.land/std@0.168.0/http/server.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('--- Account Deletion Function Invoked ---');
  console.log('Method:', req.method);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }

  try {
    const url = Deno.env.get('SUPABASE_URL');
    // Try system key first, then fallback to custom key if user set one
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');

    console.log('Env Check - URL present:', !!url);
    console.log('Env Check - Key present (System or Custom):', !!key);

    if (!url || !key) {
      const missing: string[] = [];
      if (!url) missing.push('SUPABASE_URL');
      if (!key) missing.push('SERVICE_ROLE_KEY');
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('Supabase admin client initialized.');

    // 2. Get the user from the JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({error: 'Missing Authorization header'}), {
        status: 401,
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
      });
    }

    let token = authHeader.replace('Bearer ', '');

    // Attempt to extract token from body (Workaround for Gateway 401 on User JWT)
    try {
      const body = await req.json();
      if (body.accessToken) {
        token = body.accessToken;
        console.log('Using access token from request body.');
      }
    } catch (e) {
      console.log('No body or empty body, using header token.');
    }

    console.log(`Token received (length: ${token.length}). Verifying...`);

    const {
      data: {user},
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      console.error('Auth Error Message:', authError?.message);
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: authError?.message,
          fullError: JSON.stringify(authError),
          hint: 'Token might be expired or invalid',
        }),
        {status: 401, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    const userId = user.id;
    console.log(`Verified User ID: ${userId}`);

    // 3. Delete user files from 'avatars' bucket
    console.log('Cleanup: Checking avatars bucket for files...');
    const {data: files, error: listError} = await supabaseAdmin.storage
      .from('avatars')
      .list(userId);

    if (listError) {
      console.warn('Storage list error (non-fatal):', listError.message);
    } else if (files && files.length > 0) {
      const pathsToDelete = files.map((f) => `${userId}/${f.name}`);
      console.log(`Removing ${files.length} storage objects...`);
      const {error: deleteStorageError} = await supabaseAdmin.storage
        .from('avatars')
        .remove(pathsToDelete);

      if (deleteStorageError) {
        console.error('Storage deletion failed:', deleteStorageError.message);
      } else {
        console.log('Storage cleanup successful.');
      }
    } else {
      console.log('No files found to clean up.');
    }

    // 4. Delete the Auth User
    console.log('Administrative Action: Deleting auth user...');
    const {error: deleteUserError} = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Auth user deletion failed:', deleteUserError.message);
      throw new Error(`Database admin error: ${deleteUserError.message}`);
    }

    console.log(`Successfully deleted user ${userId} and cascaded all data.`);

    return new Response(JSON.stringify({message: 'Account deleted successfully'}), {
      status: 200,
      headers: {...corsHeaders, 'Content-Type': 'application/json'},
    });
  } catch (error: any) {
    console.error('Function execution failed:', error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        hint: 'This is a server-side error. Check Supabase function logs for more details.',
      }),
      {status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
    );
  }
});
