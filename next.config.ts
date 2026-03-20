import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',           // Quando o usuário acessar a raiz
        destination: '/Inicial', // Ele será mandado para cá
        permanent: true,       // Isso ajuda no SEO e na performance
      },
    ];
  },
};

export default nextConfig;