import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("email", "expertnocode@gmail.com")
    .select("email, is_admin");

  if (error) console.error("Erreur:", error.message);
  else if (data?.length === 0) console.log("Aucun profil trouvé pour expertnocode@gmail.com — le compte existe-t-il ?");
  else console.log("✓ Admin activé:", data);
}

run();
