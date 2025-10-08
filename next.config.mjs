/** @type {import('next').NextConfig} */
const nextConfig = {
    // Basic optimizations that are stable
    optimizeFonts: true,
    swcMinify: true,
    
    // Compiler optimizations
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
    
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'fonts.googleapis.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'fonts.gstatic.com',
          port: '',
          pathname: '/**',
        },
      ],
      // Basic image optimizations
      formats: ['image/webp'],
      minimumCacheTTL: 60,
      dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
