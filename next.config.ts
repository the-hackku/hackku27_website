import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    authInterrupts: true,
  },
  redirects() {
    return [
      {
        source: "/mlh/code-of-conduct",
        destination:
          "https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/legal/privacy-policy",
        permanent: true,
      },
      {
        source: "/waiver",
        destination: "/legal/waiver",
        permanent: true,
      },
      {
        source: "/conduct",
        destination: "/legal/code-of-conduct",
        permanent: true,
      },
    ];
  },
  rewrites() {
    return [
      {
        source: "/apple-touch-icon.png",
        destination: "/images/branding/apple-touch-icon.png",
      },
      {
        source: "/apple-touch-icon-precomposed.png",
        destination: "/images/branding/apple-touch-icon.png",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
