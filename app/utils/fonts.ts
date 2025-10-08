// Alternative font configuration with better error handling
import { Inter, Poppins } from "next/font/google";

// Safe font loading with fallbacks
export const getSafeInterFont = () => {
  try {
    return Inter({ 
      subsets: ["latin"],
      display: 'swap',
      variable: '--font-inter',
      fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    });
  } catch (error) {
    console.warn('Failed to load Inter font, using system fonts');
    return null;
  }
};

export const getSafePoppinsFont = () => {
  try {
    return Poppins({
      subsets: ["latin"],
      weight: ['300', '400', '500', '600', '700'],
      display: 'swap',
      variable: '--font-poppins',
      fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    });
  } catch (error) {
    console.warn('Failed to load Poppins font, using system fonts');
    return null;
  }
};

// Fallback CSS class names
export const fontClassNames = {
  inter: getSafeInterFont()?.className || 'font-system',
  poppins: getSafePoppinsFont()?.className || 'font-system',
  variable: {
    inter: getSafeInterFont()?.variable || '',
    poppins: getSafePoppinsFont()?.variable || '',
  }
};