const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    console.log('Usage: SUPABASE_SERVICE_ROLE_KEY=your_key node manage-pro.js --email user@example.com --status true');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function managePro() {
    const args = process.argv.slice(2);
    const emailIndex = args.indexOf('--email');
    const phoneIndex = args.indexOf('--phone');
    const statusIndex = args.indexOf('--status');

    let email = emailIndex !== -1 ? args[emailIndex + 1] : null;
    let phone = phoneIndex !== -1 ? args[phoneIndex + 1] : null;
    let status = statusIndex !== -1 ? args[statusIndex + 1] === 'true' : true;

    if (!email && !phone) {
        console.error('Error: Please provide either --email or --phone.');
        process.exit(1);
    }

    console.log(`Setting pro membership for ${email || phone} to ${status}...`);

    const query = supabase.from('profiles').update({ is_pro_override: status });

    if (email) {
        query.eq('email', email);
    } else {
        query.eq('phone_number', phone);
    }

    const { data, error } = await query.select();

    if (error) {
        console.error('Error updating profile:', error.message);
        process.exit(1);
    }

    if (data && data.length > 0) {
        console.log('Successfully updated profile:');
        console.table(data.map(d => ({ id: d.id, email: d.email, is_pro: d.is_pro_override })));
    } else {
        console.warn('No profile found matching the criteria.');
    }
}

managePro();
