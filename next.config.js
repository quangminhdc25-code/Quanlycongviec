/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phép Server Actions hoạt động trên môi trường Cloud IDE (Codespaces)
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.github.dev',
        '*.app.github.dev'
      ],
    },
  },
};

module.exports = nextConfig;