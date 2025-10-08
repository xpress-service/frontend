// Temporary system fonts configuration
// Use this in layout.tsx if Google Fonts keep failing

// System font stacks
const systemFonts = {
  inter: {
    className: 'font-system-sans',
    variable: '--font-system-sans',
  },
  poppins: {
    className: 'font-system-sans',
    variable: '--font-system-sans',
  }
};

// Add this CSS to your globals.css:
/*
.font-system-sans {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Helvetica Neue', Arial, sans-serif;
}

:root {
  --font-system-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                      'Helvetica Neue', Arial, sans-serif;
}
*/

export default systemFonts;