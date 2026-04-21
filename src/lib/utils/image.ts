const STORAGE = "https://cawrucyjiyrsctbqewtt.supabase.co/storage/v1/object/public/product-images";

export const BOARD_FALLBACK_IMAGES: Record<string, string> = {
  "gun":              `${STORAGE}/gun/2026 Infamous Gun-01 - Grande.jpeg`,
  "team-ripper":      `${STORAGE}/team-ripper/2026 Infamous Ripper-01 - Grande.jpeg`,
  "nervous-love":     `${STORAGE}/nervous-love/2026 Infamous Nervous Love-01 - Grande.jpeg`,
  "sanglier-sauvage": `${STORAGE}/sanglier-sauvage/2026 Infamous Sanglier Sauvage-01 - Grande.jpeg`,
  "dreamy-panda":     `${STORAGE}/dreamy-panda/2026 Infamous Dreamy Panda-01 - Grande.jpeg`,
  "punk-cat":         `${STORAGE}/punk-cat/2026 Infamous Punk Cat-01 - Grande.jpeg`,
  "park-rat":         `${STORAGE}/park-rat/2026 Infamous Park Rat-01 - Grande.jpeg`,
  "night-queen":      `${STORAGE}/night-queen/2026 Infamous Night Queen-01 - Grande.jpeg`,
  "lipstick-cam":     `${STORAGE}/lipstick-cam/2026 Infamous LipStick Cam-01 - Grande.jpeg`,
  "kids-boards":      `${STORAGE}/kids-boards/2026 Infamous Kids Boards-01 - Grande.jpeg`,
};

export const DEFAULT_FALLBACK = BOARD_FALLBACK_IMAGES["gun"];

export function getProductImageUrl(storagePath: string | undefined | null): string | null {
  if (!storagePath) return null;
  if (storagePath.startsWith("http")) return storagePath;
  return `${STORAGE}/${storagePath}`;
}
