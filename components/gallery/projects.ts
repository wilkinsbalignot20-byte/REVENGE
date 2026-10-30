export type Project = {
  id: string;
  title: string;
  /** Saan pupunta kapag na-click ang card */
  url: string;
  /** Public ID ng larawan sa Cloudinary (Media Library → Copy public ID) */
  publicId: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** Gumagawa ng Cloudinary URL (4:3, 1200x900) para sa isang public ID. */
export function cldUrl(publicId: string): string {
  if (!CLOUD_NAME || !publicId) return "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_1200,h_900,f_auto,q_auto/${publicId}`;
}

// PALITAN ang publicId at url ng totoong Manipu projects mo.
// Kapag walang larawan, may text tile na lalabas kaya hindi mag-crash ang page.
export const projects: Project[] = [
  { id: "1", title: "Storefront", url: "/", publicId: "image2" },
  { id: "2", title: "Merchant Dashboard", url: "/", publicId: "image3" },
  { id: "3", title: "Community Forum", url: "/", publicId: "sit2" },
  { id: "4", title: "Checkout", url: "/", publicId: "sit" },
  { id: "5", title: "Product Page", url: "/projects/product-page", publicId: "acc" },
  { id: "6", title: "Seller Profile", url: "/", publicId: "power" },
  { id: "7", title: "Landing Page", url: "/", publicId: "work" },
  { id: "8", title: "Mobile View", url: "/", publicId: "Frame_1" },
];