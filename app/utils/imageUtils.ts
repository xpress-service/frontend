/**
 * Utility functions for handling profile images and fallbacks
 */

export const DEFAULT_PROFILE_IMAGE = "/users/Ellipse 24.svg";

/**
 * Get profile image URL with fallback
 * @param profileImage - The profile image URL from user data
 * @returns Valid image URL or default fallback
 */
export const getProfileImageUrl = (profileImage?: string | null): string => {
  // Return default if no profile image provided
  if (!profileImage) {
    return DEFAULT_PROFILE_IMAGE;
  }
  
  // Check if it's a valid URL (starts with http/https or is a relative path)
  if (profileImage.startsWith('http') || profileImage.startsWith('/')) {
    return profileImage;
  }
  
  // If it's just a filename or invalid, return default
  return DEFAULT_PROFILE_IMAGE;
};

/**
 * Handle image error by setting fallback
 * @param event - The error event from Image component
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const target = event.currentTarget;
  if (target.src !== DEFAULT_PROFILE_IMAGE) {
    target.src = DEFAULT_PROFILE_IMAGE;
  }
};

/**
 * Props for Next.js Image component with profile image handling
 */
export const getProfileImageProps = (profileImage?: string | null) => ({
  src: getProfileImageUrl(profileImage),
  onError: handleImageError,
  alt: "Profile"
});