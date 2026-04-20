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

const sourceDir = "/Users/ulysse/Downloads/INFAMOUS/Visuelle Boards";

const boardMap: Record<string, string> = {
  "gun":              "2026 Infamous Gun-01 - Grande.jpeg",
  "team-ripper":      "2026 Infamous Ripper-01 - Grande.jpeg",
  "nervous-love":     "2026 Infamous Nervous Love-01 - Grande.jpeg",
  "sanglier-sauvage": "2026 Infamous Sanglier Sauvage-01 - Grande.jpeg",
  "dreamy-panda":     "2026 Infamous Dreamy Panda-01 - Grande.jpeg",
  "punk-cat":         "2026 Infamous Punk Cat-01 - Grande.jpeg",
  "park-rat":         "2026 Infamous Park Rat-01 - Grande.jpeg",
  "night-queen":      "2026 Infamous Night Queen-01 - Grande.jpeg",
  "lipstick-cam":     "2026 Infamous LipStick Cam-01 - Grande.jpeg",
  "kids-boards":      "2026 Infamous Kids Boards-01 - Grande.jpeg",
};

async function replaceImages() {
  for (const [slug, filename] of Object.entries(boardMap)) {
    const localPath = path.join(sourceDir, filename);
    if (!fs.existsSync(localPath)) {
      console.log(`  ✗ ${slug}: fichier non trouvé (${filename})`);
      continue;
    }

    const storagePath = `${slug}/${filename}`;
    const fileBuffer = fs.readFileSync(localPath);

    const { error } = await supabase.storage
      .from("product-images")
      .upload(storagePath, fileBuffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      console.error(`  ✗ ${slug}:`, error.message);
      continue;
    }

    // Mettre à jour le chemin en DB
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (product) {
      await supabase
        .from("product_images")
        .update({ storage_path: storagePath })
        .eq("product_id", product.id)
        .eq("is_primary", true);
    }

    console.log(`  ✓ ${slug} → ${storagePath}`);
  }

  console.log("\nDone!");
}

replaceImages().catch(console.error);
