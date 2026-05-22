/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cấu hình cho phép Server Actions hoạt động
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.github.dev',
        '*.app.github.dev'
      ],
    },
  },
  
  // === "BÙA CHÚ" CHỐNG LƯU BỘ NHỚ ĐỆM (CACHE BUSTER) ===
  async headers() {
    return [
      {
        // Áp dụng cho toàn bộ các trang web (.*)
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;