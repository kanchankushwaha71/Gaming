/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript configuration - only ignore in development for now
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  // ESLint configuration - only ignore in development for now
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_ESLINT === 'true',
  },
  // Force Next.js to treat files as JavaScript
  experimental: {
    // optimizeCss: true, // Disabled due to missing critters dependency on Vercel
    forceSwcTransforms: true,
  },
  // Add public environment variables as fallback
  env: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
  },
  // Image optimization settings
  images: {
    domains: [
      'localhost',
      // Supabase storage domain for images
      'cfgxshnrcogvosjukytk.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cfgxshnrcogvosjukytk.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Compress assets
  compress: true,
  
  // Remove powered by header
  poweredByHeader: false,
  
  // Generate ETags for caching
  generateEtags: true,
  
  // Experimental features - disable optimizeCss for Vercel deployment
  experimental: {
    // optimizeCss: true, // Disabled due to missing critters dependency on Vercel
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Remove standalone output for Vercel deployment
  // output: 'standalone',
   
  // Custom webpack config to handle problematic imports
  webpack: (config, { isServer, dev }) => {
    // Fix optimization settings without conflicting options
    if (!config.optimization) {
      config.optimization = {};
    }
    
    // Only set these in production builds
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        '@mapbox/node-pre-gyp': false,
        'canvas': false,
        aws4: false,
      };
    }
    
    return config;
  },
  
  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig; 