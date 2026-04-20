import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, "$1");
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sourceDir = "/Users/ulysse/Downloads/INFAMOUS/shooting";

async function replaceShootingImages() {
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith("- Grande.jpeg"));

  for (const filename of files) {
    const localPath = path.join(sourceDir, filename);
    const fileBuffer = fs.readFileSync(localPath);

    const { error } = await supabase.storage
      .from("lifestyle")
      .upload(filename, fileBuffer, { contentType: "image/jpeg", upsert: true });

    if (error) console.error(`  ✗ ${filename}:`, error.message);
    else console.log(`  ✓ ${filename}`);
  }

  console.log(`\nDone! ${files.length} fichiers uploadés.`);
}

replaceShootingImages().catch(console.error);
