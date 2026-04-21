// Répare les product_images pour pointer vers les Grande.jpeg dans Supabase Storage
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.join(process.cwd(), ".env.local");
fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`;

const boardImages: Record<string, string> = {
  "gun":              `${STORAGE_BASE}/gun/2026 Infamous Gun-01 - Grande.jpeg`,
  "team-ripper":      `${STORAGE_BASE}/team-ripper/2026 Infamous Ripper-01 - Grande.jpeg`,
  "nervous-love":     `${STORAGE_BASE}/nervous-love/2026 Infamous Nervous Love-01 - Grande.jpeg`,
  "sanglier-sauvage": `${STORAGE_BASE}/sanglier-sauvage/2026 Infamous Sanglier Sauvage-01 - Grande.jpeg`,
  "dreamy-panda":     `${STORAGE_BASE}/dreamy-panda/2026 Infamous Dreamy Panda-01 - Grande.jpeg`,
  "punk-cat":         `${STORAGE_BASE}/punk-cat/2026 Infamous Punk Cat-01 - Grande.jpeg`,
  "park-rat":         `${STORAGE_BASE}/park-rat/2026 Infamous Park Rat-01 - Grande.jpeg`,
  "night-queen":      `${STORAGE_BASE}/night-queen/2026 Infamous Night Queen-01 - Grande.jpeg`,
  "lipstick-cam":     `${STORAGE_BASE}/lipstick-cam/2026 Infamous LipStick Cam-01 - Grande.jpeg`,
  "kids-boards":      `${STORAGE_BASE}/kids-boards/2026 Infamous Kids Boards-01 - Grande.jpeg`,
};

async function repair() {
  for (const [slug, imageUrl] of Object.entries(boardImages)) {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!product) { console.log(`  ✗ ${slug}: product not found`); continue; }

    await supabase.from("product_images").delete().eq("product_id", product.id);

    const { error } = await supabase.from("product_images").insert({
      product_id: product.id,
      storage_path: imageUrl,
      is_primary: true,
      sort_order: 0,
    });

    if (error) console.error(`  ✗ ${slug}:`, error.message);
    else console.log(`  ✓ ${slug}`);
  }
  console.log("\nDone!");
}

repair().catch(console.error);
