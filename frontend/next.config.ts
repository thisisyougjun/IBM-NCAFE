import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BFF 패턴: /api/* 요청은 Next.js API Route(Catch-all 프록시)가 처리
  // 이미지도 /api/images/:path* 로 요청하면 BFF 프록시를 통해 백엔드에 전달됨
  // (next.config.ts rewrites는 빌드타임에 고정되어 배포 시 API_BASE_URL 반영 불가)
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: `${process.env.API_BASE_URL || 'http://backend:8081'}/images/:path*`,
      },
      {
        source: '/api/images/:path*',
        destination: `${process.env.API_BASE_URL || 'http://backend:8081'}/images/:path*`,
      },
    ];
  },
};

export default nextConfig;

