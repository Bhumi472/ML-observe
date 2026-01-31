/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove turbo and optimizeFonts options for Next.js 16
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // If you need to fix font errors, add this:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "font-src 'self' https://fonts.gstatic.com data:;",
          },
        ],
      },
    ];
  },
}

export default nextConfig;