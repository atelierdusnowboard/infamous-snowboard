// Upload product and lifestyle images to Supabase Storage
// Usage: npx tsx scripts/upload-images.ts
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
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Board image slug mapping
const boardImageFiles: Record<string, string> = {
  gun: "2026 Infamous Gun-01.JPG",
  "team-ripper": "2026 Infamous Ripper-01.JPG",
  "nervous-love": "2026 Infamous Nervous Love-01.JPG",
  "sanglier-sauvage": "2026 Infamous Sanglier Sauvage-01.JPG",
  "dreamy-panda": "2026 Infamous Dreamy Panda-01.JPG",
  "punk-cat": "2026 Infamous Punk Cat-01.JPG",
  "park-rat": "2026 Infamous Park Rat-01.JPG",
  "night-queen": "2026 Infamous Night Queen-01.JPG",
  "lipstick-cam": "2026 Infamous LipStick Cam-01.JPG",
  "kids-boards": "2026 Infamous Kids Boards-01.JPG",
};

const boardsDir = path.join(process.cwd(), "public", "boards");
const lifestyleDir = path.join(process.cwd(), "public", "lifestyle");

async function ensureBucket(bucket: string) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === bucket);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
    });
    if (error) console.error(`Error creating bucket ${bucket}:`, error.message);
    else console.log(`Created bucket: ${bucket}`);
  }
}

async function uploadFile(
  bucket: string,
  localPath: string,
  storagePath: string
): Promise<string | null> {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase().slice(1);
  const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`  Error uploading ${storagePath}:`, error.message);
    return null;
  }
  return storagePath;
}

async function uploadImages() {
  // Ensure buckets exist
  await ensureBucket("product-images");
  await ensureBucket("lifestyle");

  const imageMap: Record<string, string> = {};

  // Upload board images
  console.log("\nUploading product images...");
  for (const [slug, filename] of Object.entries(boardImageFiles)) {
    const localPath = path.join(boardsDir, filename);
    if (!fs.existsSync(localPath)) {
      console.log(`  Skipping ${filename} (not found)`);
      continue;
    }
    const storagePath = `${slug}/${filename}`;
    const result = await uploadFile("product-images", localPath, storagePath);
    if (result) {
      imageMap[slug] = storagePath;
      console.log(`  ✓ ${slug} -> ${storagePath}`);
    }
  }

  // Upload lifestyle images
  console.log("\nUploading lifestyle images...");
  if (fs.existsSync(lifestyleDir)) {
    const files = fs.readdirSync(lifestyleDir).filter((f) =>
      /\.(jpg|jpeg|png)$/i.test(f)
    );
    for (const file of files) {
      const localPath = path.join(lifestyleDir, file);
      const result = await uploadFile("lifestyle", localPath, file);
      if (result) console.log(`  ✓ ${file}`);
    }
  }

  // Save image map
  const outputDir = path.join(process.cwd(), "assets", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const mapPath = path.join(outputDir, "image-map.json");
  fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2));
  console.log(`\nSaved image map to ${mapPath}`);
  console.log("Done!");
}

uploadImages().catch(console.error);
