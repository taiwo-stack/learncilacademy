import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wexqhlrhfostrpehknka.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleHFobHJoZm9zdHJwZWhrbmthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2NTkyMCwiZXhwIjoyMDk4MzQxOTIwfQ.ircei5gdSVPpQ1nO5-OQtyeNeDfX3mS-abFI3L9q2rI";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleHFobHJoZm9zdHJwZWhrbmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjU5MjAsImV4cCI6MjA5ODM0MTkyMH0.pUr90lJW2HsLh5Xs7wW_FME_ixFuchkCT8xZALnWaek";
const TARGET_EMAIL = "tamilore@foundaxia.com";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function diagnose() {
  console.log("=== Diagnosing login for:", TARGET_EMAIL, "===\n");

  console.log("--- Step 1: Checking auth.users ---");
  const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
  } else {
    const found = userList.users.find(u => u.email.toLowerCase() === TARGET_EMAIL.toLowerCase());
    if (!found) {
      console.log("USER NOT FOUND in auth.users!");
      console.log("All auth users:");
      userList.users.forEach(u => console.log(" -", u.email, "| confirmed:", u.email_confirmed_at ? "YES" : "NO", "| banned:", u.banned_until || "NO"));
    } else {
      console.log("User FOUND:", found.id);
      console.log("  Email confirmed:", found.email_confirmed_at ? "YES" : "NO - NOT CONFIRMED");
      console.log("  Last sign in:", found.last_sign_in_at || "Never");
      console.log("  Banned until:", found.banned_until || "Not banned");
    }
  }

  console.log("\n--- Step 2: Checking profiles ---");
  const { data: profileData, error: profileError } = await supabaseAdmin.from("profiles").select("*").ilike("email", TARGET_EMAIL);
  if (profileError) console.error("Error:", profileError.message);
  else if (!profileData?.length) console.log("No profile found");
  else profileData.forEach(p => console.log(JSON.stringify(p)));

  console.log("\n--- Step 3: Checking students ---");
  const { data: studentData, error: studentError } = await supabaseAdmin.from("students").select("id,full_name,email,status").ilike("email", TARGET_EMAIL);
  if (studentError) console.error("Error:", studentError.message);
  else if (!studentData?.length) console.log("No student record found");
  else studentData.forEach(s => console.log(JSON.stringify(s)));

  console.log("\n--- Step 4: Attempting login ---");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email: TARGET_EMAIL, password: "Tamilore@3769S" });
  if (loginError) console.log("Login FAILED:", loginError.message, "| status:", loginError.status);
  else console.log("Login SUCCEEDED! User ID:", loginData.user?.id);

  console.log("\n=== Done ===");
}

diagnose().catch(console.error);
