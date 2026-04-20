// Seed script: inserts categories + products + variants into Supabase
// Usage: npx tsx scripts/seed-database.ts
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// Load env
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  env.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, "$1");
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Load products data
const productsPath = path.join(process.cwd(), "assets", "data", "products.json");
if (!fs.existsSync(productsPath)) {
  console.error("products.json not found. Run: npx tsx scripts/parse-odt-specs.ts first");
  process.exit(1);
}

const boards = JSON.parse(fs.readFileSync(productsPath, "utf8"));

// Load image map if it exists
let imageMap: Record<string, string> = {};
const imageMapPath = path.join(process.cwd(), "assets", "data", "image-map.json");
if (fs.existsSync(imageMapPath)) {
  imageMap = JSON.parse(fs.readFileSync(imageMapPath, "utf8"));
  console.log("Loaded image map:", Object.keys(imageMap).length, "entries");
}

async function seed() {
  console.log("Seeding database...");

  // 1. Get or create categories
  const { data: existingCats } = await supabase
    .from("categories")
    .select("id, slug");
  const catMap: Record<string, string> = {};
  (existingCats ?? []).forEach((c: { id: string; slug: string }) => {
    catMap[c.slug] = c.id;
  });

  // 2. Insert products
  for (const board of boards) {
    console.log(`Inserting product: ${board.name}...`);

    const { data: product, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          name: board.name,
          slug: board.slug,
          tagline: board.tagline,
          description: board.description,
          price: board.price,
          category_id: catMap[board.category] ?? null,
          specs: board.specs,
          is_published: true,
          is_featured: board.is_featured,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (productError) {
      console.error(`Error inserting ${board.name}:`, productError.message);
      continue;
    }

    // Delete existing variants and re-insert
    await supabase.from("product_variants").delete().eq("product_id", product.id);
    for (const variant of board.variants) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .insert({
          product_id: product.id,
          size_cm: variant.size_cm,
          stock_qty: variant.stock_qty,
          price_delta: variant.price_delta,
        });

      if (variantError) {
        console.error(
          `Error inserting variant ${variant.size_cm} for ${board.name}:`,
          variantError.message
        );
      }
    }

    // Delete existing images and re-insert
    const imagePath = imageMap[board.slug];
    if (imagePath) {
      await supabase.from("product_images").delete().eq("product_id", product.id);
      const { error: imageError } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          storage_path: imagePath,
          is_primary: true,
          sort_order: 0,
        });

      if (imageError) {
        console.error(
          `Error inserting image for ${board.name}:`,
          imageError.message
        );
      }
    }

    console.log(`  ✓ ${board.name} (${board.variants.length} variants)`);
  }

  console.log("\nSeeding complete!");
}

seed().catch(console.error);
