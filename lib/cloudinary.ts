const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Gumagawa ng Cloudinary URL mula sa public ID.
 * Walang cloud name o public ID = walang URL (""), kaya hindi mag-crash ang page.
 */
export function cldUrl(publicId: string, width = 1200, height = 900): string {
  if (!CLOUD_NAME || !publicId) return "";
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${publicId}`;
}