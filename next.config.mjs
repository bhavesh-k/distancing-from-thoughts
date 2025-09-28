/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable fast refresh for better hot reloading
  experimental: {
    // Ensure CSS changes trigger hot reload
    optimizeCss: false,
  },
  // Disable static optimization in development for better hot reloading
  ...(process.env.NODE_ENV === 'development' && {
    output: undefined,
  }),
};

export default nextConfig;
