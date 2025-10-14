/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  devIndicators: {
    buildActivity: false,
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    loader: 'default',
    unoptimized: false,
  },
  // Dynamic server-side features enabled
  // output: 'export', // Commented out to enable API routes
  trailingSlash: true,
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // Remove console.logs in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'framer-motion',
      'date-fns',
    ],
    // Optimize CSS
    optimizeCss: true,
    // Optimize fonts
    optimizeFonts: true,
  },
  // Optimize production output
  productionBrowserSourceMaps: false,
  // Compress responses
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Reduce JavaScript payload
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  async redirects() {
    return [
      // onboarding
      {
        source: "/user-type-selection",
        destination: "/onboarding/user-type-selection",
        permanent: true,
      },
      {
        source: "/professional-intro",
        destination: "/onboarding/professional-intro",
        permanent: true,
      },
      {
        source: "/specialty-selection",
        destination: "/onboarding/specialty-selection",
        permanent: true,
      },
      {
        source: "/photo-guidelines",
        destination: "/onboarding/photo-guidelines",
        permanent: true,
      },
      {
        source: "/photo-upload",
        destination: "/onboarding/photo-upload",
        permanent: true,
      },
      {
        source: "/personal-data",
        destination: "/onboarding/personal-data",
        permanent: true,
      },
      {
        source: "/completion",
        destination: "/onboarding/completion",
        permanent: true,
      },
      // profesional → publication
      {
        source: "/profesional",
        destination: "/publication",
        permanent: true,
      },
      {
        source: "/profesional/:path*",
        destination: "/publication/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
