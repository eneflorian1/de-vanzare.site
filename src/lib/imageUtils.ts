/**
 * Utility functions for handling image paths
 */

/**
 * Ensures that an image path starts with a forward slash and exists
 * Falls back to default image if the path is missing or invalid
 */
export function getImagePath(imagePath: string | null | undefined, defaultImage: string = '/images/default-listing.jpg'): string {
  if (!imagePath) {
    return defaultImage;
  }
  
  // Filtrăm URL-uri invalide (blob sau data)
  if (imagePath.includes('blob:') || imagePath.includes('data:')) {
    return defaultImage;
  }
  
  // Asigurăm că calea începe cu / dacă nu este URL absolut
  if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
    return `/${imagePath}`;
  }
  
  return imagePath;
}

/**
 * Gets a primary image URL from an array of listing images
 */
export function getPrimaryImageUrl(
  images: Array<{ imageUrl?: string; url?: string; isPrimary?: boolean }> | null | undefined, 
  defaultImage: string = '/images/default-listing.jpg'
): string {
  if (!images || images.length === 0) {
    return defaultImage;
  }
  
  // Try to find the primary image
  const primaryImage = images.find(img => img.isPrimary);
  const imageUrl = primaryImage?.imageUrl || primaryImage?.url || images[0]?.imageUrl || images[0]?.url;
  
  return getImagePath(imageUrl, defaultImage);
}
