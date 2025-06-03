/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
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