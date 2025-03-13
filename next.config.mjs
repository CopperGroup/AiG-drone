/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
      domains: ['shop.juventa.ua', 'utfs.io', 'uploadthing.com', "www.sveamoda.com.ua"], 
      remotePatterns: [
        {
          protocol: "https",
          hostname: "*.rozetka.com.ua",
        },
      ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default nextConfig;
