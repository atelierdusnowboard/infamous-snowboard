// Hardcoded product specs for all 10 Infamous Snowboard models (2026 collection)
// Run: npx tsx scripts/parse-odt-specs.ts

import * as fs from "fs";
import * as path from "path";

interface BoardSpec {
  name: string;
  slug: string;
  tagline: string;
  price: number;
  description: string;
  category: "snowboards" | "kids" | "park" | "freeride";
  is_featured: boolean;
  specs: {
    sizes_cm: number[];
    flex_rating: number;
    profile: string;
    terrain: string;
    difficulty: string;
    core: string;
    base: string;
    year: number;
    [key: string]: unknown;
  };
  variants: Array<{ size_cm: number; stock_qty: number; price_delta: number }>;
}

const boards: BoardSpec[] = [
  {
    name: "Gun",
    slug: "gun",
    tagline: "Built for the pipe. Nothing else.",
    price: 549,
    description:
      "The Gun is Infamous's answer to pipe and park performance. Stiff, precise, and unforgiving — designed for riders who know exactly what they want.",
    category: "park",
    is_featured: true,
    specs: {
      sizes_cm: [148, 151, 154, 156],
      flex_rating: 8,
      profile: "Twin",
      terrain: "Park / Pipe",
      difficulty: "Expert",
      core: "Poplar / Paulownia",
      base: "Sintered 7200",
      year: 2026,
      recommended_binding: "Freestyle",
      edge_tech: "Double radius edges",
    },
    variants: [
      { size_cm: 148, stock_qty: 5, price_delta: 0 },
      { size_cm: 151, stock_qty: 8, price_delta: 0 },
      { size_cm: 154, stock_qty: 6, price_delta: 0 },
      { size_cm: 156, stock_qty: 3, price_delta: 10 },
    ],
  },
  {
    name: "Team Ripper",
    slug: "team-ripper",
    tagline: "All-mountain. No excuses.",
    price: 529,
    description:
      "The Team Ripper is your daily driver. From groomers to powder, rails to natural features — it handles everything without complaining.",
    category: "snowboards",
    is_featured: true,
    specs: {
      sizes_cm: [148, 151, 154, 156, 158],
      flex_rating: 6,
      profile: "Directional Twin",
      terrain: "All-Mountain",
      difficulty: "Intermediate / Advanced",
      core: "Poplar",
      base: "Sintered 7200",
      year: 2026,
      setback: "20mm",
    },
    variants: [
      { size_cm: 148, stock_qty: 7, price_delta: 0 },
      { size_cm: 151, stock_qty: 10, price_delta: 0 },
      { size_cm: 154, stock_qty: 8, price_delta: 0 },
      { size_cm: 156, stock_qty: 5, price_delta: 0 },
      { size_cm: 158, stock_qty: 4, price_delta: 15 },
    ],
  },
  {
    name: "Nervous Love",
    slug: "nervous-love",
    tagline: "Edge to edge. Raw carving machine.",
    price: 559,
    description:
      "The Nervous Love is for those who carve hard and don't look back. Directional shape, stiff flex — pure edge control.",
    category: "freeride",
    is_featured: false,
    specs: {
      sizes_cm: [151, 154, 156, 158, 161],
      flex_rating: 7,
      profile: "Directional",
      terrain: "Carving / Freeride",
      difficulty: "Advanced / Expert",
      core: "Ash / Poplar",
      base: "Sintered 8000",
      year: 2026,
      camber: "Full Camber",
      edge_bevel: "0.5°",
    },
    variants: [
      { size_cm: 151, stock_qty: 5, price_delta: 0 },
      { size_cm: 154, stock_qty: 7, price_delta: 0 },
      { size_cm: 156, stock_qty: 6, price_delta: 0 },
      { size_cm: 158, stock_qty: 4, price_delta: 10 },
      { size_cm: 161, stock_qty: 2, price_delta: 20 },
    ],
  },
  {
    name: "Sanglier Sauvage",
    slug: "sanglier-sauvage",
    tagline: "Deep powder. Wild lines.",
    price: 569,
    description:
      "Named after the wild boar, the Sanglier Sauvage is built for freeride and powder charging. Set back stance, tapered tail — go deep.",
    category: "freeride",
    is_featured: false,
    specs: {
      sizes_cm: [154, 156, 158, 161, 164],
      flex_rating: 7,
      profile: "Setback Directional",
      terrain: "Freeride / Powder",
      difficulty: "Advanced / Expert",
      core: "Bamboo / Poplar",
      base: "Sintered 8000",
      year: 2026,
      setback: "30mm",
      nose_width: "310mm",
      taper: "25mm",
    },
    variants: [
      { size_cm: 154, stock_qty: 4, price_delta: 0 },
      { size_cm: 156, stock_qty: 6, price_delta: 0 },
      { size_cm: 158, stock_qty: 5, price_delta: 0 },
      { size_cm: 161, stock_qty: 3, price_delta: 10 },
      { size_cm: 164, stock_qty: 2, price_delta: 20 },
    ],
  },
  {
    name: "Dreamy Panda",
    slug: "dreamy-panda",
    tagline: "Soft. Forgiving. Ready to ride.",
    price: 459,
    description:
      "The Dreamy Panda is a beginner-to-intermediate women's board designed for progression. Forgiving flex, catch-free edges, and playful feel.",
    category: "snowboards",
    is_featured: false,
    specs: {
      sizes_cm: [138, 141, 144, 147],
      flex_rating: 4,
      profile: "Rocker / Flat",
      terrain: "All-Mountain",
      difficulty: "Beginner / Intermediate",
      core: "Paulownia",
      base: "Extruded",
      year: 2026,
      gender: "Women's",
      catch_free: "Yes",
    },
    variants: [
      { size_cm: 138, stock_qty: 6, price_delta: 0 },
      { size_cm: 141, stock_qty: 9, price_delta: 0 },
      { size_cm: 144, stock_qty: 7, price_delta: 0 },
      { size_cm: 147, stock_qty: 4, price_delta: 0 },
    ],
  },
  {
    name: "Punk Cat",
    slug: "punk-cat",
    tagline: "Park. Rails. Send it.",
    price: 489,
    description:
      "The Punk Cat is built for jib sessions, creative lines, and park destruction. Medium flex, true twin — do what you want with it.",
    category: "park",
    is_featured: true,
    specs: {
      sizes_cm: [146, 149, 152, 155],
      flex_rating: 5,
      profile: "Twin",
      terrain: "Park / Street",
      difficulty: "Intermediate / Advanced",
      core: "Poplar",
      base: "Extruded",
      year: 2026,
      nose_rocker: "5mm",
      tail_rocker: "5mm",
    },
    variants: [
      { size_cm: 146, stock_qty: 7, price_delta: 0 },
      { size_cm: 149, stock_qty: 10, price_delta: 0 },
      { size_cm: 152, stock_qty: 8, price_delta: 0 },
      { size_cm: 155, stock_qty: 5, price_delta: 0 },
    ],
  },
  {
    name: "Park Rat",
    slug: "park-rat",
    tagline: "Butter. Jib. Repeat.",
    price: 469,
    description:
      "The Park Rat is for riders who live on rails and boxes. Soft flex, flat base — perfect for butter tricks and creative jib sessions.",
    category: "park",
    is_featured: false,
    specs: {
      sizes_cm: [145, 148, 151, 154],
      flex_rating: 3,
      profile: "Twin Flat",
      terrain: "Park / Jib",
      difficulty: "Beginner / Intermediate",
      core: "Paulownia / Poplar",
      base: "Extruded",
      year: 2026,
      base_profile: "Flat",
      butter_zone: "Reinforced torsion box",
    },
    variants: [
      { size_cm: 145, stock_qty: 8, price_delta: 0 },
      { size_cm: 148, stock_qty: 12, price_delta: 0 },
      { size_cm: 151, stock_qty: 9, price_delta: 0 },
      { size_cm: 154, stock_qty: 5, price_delta: 0 },
    ],
  },
  {
    name: "Night Queen",
    slug: "night-queen",
    tagline: "All mountain. No curfew.",
    price: 499,
    description:
      "The Night Queen is a women's all-mountain board that performs from first lift to last run. Medium flex, versatile shape.",
    category: "snowboards",
    is_featured: true,
    specs: {
      sizes_cm: [141, 144, 147, 150],
      flex_rating: 5,
      profile: "Camber / Rocker Hybrid",
      terrain: "All-Mountain",
      difficulty: "Intermediate / Advanced",
      core: "Poplar",
      base: "Sintered 7200",
      year: 2026,
      gender: "Women's",
      edge_grip: "Carbon Power Spine",
    },
    variants: [
      { size_cm: 141, stock_qty: 6, price_delta: 0 },
      { size_cm: 144, stock_qty: 8, price_delta: 0 },
      { size_cm: 147, stock_qty: 7, price_delta: 0 },
      { size_cm: 150, stock_qty: 4, price_delta: 0 },
    ],
  },
  {
    name: "LipStick Cam",
    slug: "lipstick-cam",
    tagline: "Women's freestyle. Ride what you want.",
    price: 479,
    description:
      "The LipStick Cam is a women's freestyle board designed for progression in the park and beyond. Soft-medium flex, rockered twin shape.",
    category: "park",
    is_featured: false,
    specs: {
      sizes_cm: [140, 143, 146, 149],
      flex_rating: 5,
      profile: "Rocker Twin",
      terrain: "Park / All-Mountain",
      difficulty: "Intermediate",
      core: "Paulownia / Poplar",
      base: "Extruded",
      year: 2026,
      gender: "Women's",
      nose_tail: "Rocker 8mm",
    },
    variants: [
      { size_cm: 140, stock_qty: 7, price_delta: 0 },
      { size_cm: 143, stock_qty: 9, price_delta: 0 },
      { size_cm: 146, stock_qty: 6, price_delta: 0 },
      { size_cm: 149, stock_qty: 4, price_delta: 0 },
    ],
  },
  {
    name: "Kids Boards",
    slug: "kids-boards",
    tagline: "Start here. Grow fast.",
    price: 299,
    description:
      "Infamous Kids Boards are built to help young riders progress quickly. Ultra-soft flex, durable construction, and graphics they'll actually like.",
    category: "kids",
    is_featured: false,
    specs: {
      sizes_cm: [100, 110, 120, 130],
      flex_rating: 2,
      profile: "Flat / Rocker",
      terrain: "All-Mountain",
      difficulty: "Beginner",
      core: "Paulownia",
      base: "Extruded",
      year: 2026,
      age_range: "5–12 years",
      weight_range: "20–50 kg",
    },
    variants: [
      { size_cm: 100, stock_qty: 10, price_delta: 0 },
      { size_cm: 110, stock_qty: 12, price_delta: 0 },
      { size_cm: 120, stock_qty: 10, price_delta: 0 },
      { size_cm: 130, stock_qty: 8, price_delta: 10 },
    ],
  },
];

// Ensure output directory exists
const outputDir = path.join(process.cwd(), "assets", "data");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "products.json");
fs.writeFileSync(outputPath, JSON.stringify(boards, null, 2));
console.log(`✓ Wrote ${boards.length} boards to ${outputPath}`);
