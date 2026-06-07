// scripts/keep-alive.js
// This script pings the Supabase REST API to keep the database awake.
// Run it using: node scripts/keep-alive.js
// You should set SUPABASE_URL and SUPABASE_KEY in your environment variables.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_KEY environment variables are required.");
  process.exit(1);
}

// Clean url and remove trailing slash if any
const baseUrl = supabaseUrl.replace(/\/$/, "");

async function pingDatabase() {
  console.log("Sending keep-alive ping to Supabase...");
  try {
    const response = await fetch(`${baseUrl}/rest/v1/school_assessments?select=dmc_code&limit=1`, {
      method: "GET",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Ping successful! Database is awake.");
  } catch (error) {
    console.error("Ping failed:", error.message);
    process.exit(1);
  }
}

pingDatabase();
