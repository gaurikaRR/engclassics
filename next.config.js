/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org', // book covers via ISBN
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile photos
      },
    ],
  },
}

module.exports = nextConfig
