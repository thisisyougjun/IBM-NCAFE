import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BFF 패턴: /api/* 요청은 모두 Next.js API Route(Catch-all 프록시)가 처리
  // → next.config.ts의 rewrites가 필요 없어짐 (기존 rewrite 제거)
  //
  // /images/* 는 Spring Boot 정적 파일이므로 직접 rewrite
  async rewrites() {
    const apiBase = process.env.API_BASE_URL || "http://localhost:8080";
    return {
      beforeFiles: [],
      afterFiles: [
        // 이미지 파일만 Spring Boot에서 직접 제공
        {
          source: "/images/:path*",
          destination: `${apiBase}/images/:path*`,
        },
      ],
      fallback: [],
    };
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
