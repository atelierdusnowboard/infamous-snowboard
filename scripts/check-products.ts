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

async function check() {
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, is_published, category_id")
    .order("name");

  console.log("\nPRODUCTS:");
  products?.forEach(p => {
    console.log(`  ${p.is_published ? "✓" : "✗ DRAFT"} [${p.slug}] ${p.name}`);
  });

  // Fix: republish all unpublished products
  const unpublished = products?.filter(p => !p.is_published) ?? [];
  if (unpublished.length > 0) {
    console.log(`\nFixing ${unpublished.length} unpublished products...`);
    await supabase.from("products").update({ is_published: true })
      .in("id", unpublished.map(p => p.id));
    console.log("✓ All products set to published");
  } else {
    console.log("\nAll products are published ✓");
  }

  const { data: images } = await supabase.from("product_images").select("product_id, storage_path, is_primary");
  console.log(`\nPRODUCT IMAGES: ${images?.length ?? 0} rows`);
  images?.slice(0, 3).forEach(i => console.log(`  is_primary=${i.is_primary} path=${i.storage_path.slice(0, 60)}`));
}

check().catch(console.error);
