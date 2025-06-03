/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'bar-opal.vercel.app']
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    })
    return config
  },
}

module.exports = nextConfig 