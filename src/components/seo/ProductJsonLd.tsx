import { JsonLd } from "./JsonLd";
import { formatPrice } from "@/lib/utils/format";

interface ProductJsonLdProps {
  name: string;
  description?: string;
  price: number;
  slug: string;
  imageUrl?: string;
  inStock?: boolean;
}

export function ProductJsonLd({
  name,
  description,
  price,
  slug,
  imageUrl,
  inStock = true,
}: ProductJsonLdProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://infamous-snowboard.com";

  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description,
    image: imageUrl,
    url: `${siteUrl}/products/${slug}`,
    brand: {
      "@type": "Brand",
      name: "Infamous Snowboard",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${slug}`,
      priceCurrency: "EUR",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Infamous Snowboard",
      },
    },
  };

  return <JsonLd data={data} />;
}
