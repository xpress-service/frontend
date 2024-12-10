/** @type {import('next').NextConfig} */
const nextConfig = {
    // images: {
    //     domains: ['localhost:3000'], 
    //   },

    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
};

export default nextConfig;
