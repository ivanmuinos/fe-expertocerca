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
  },
  // Dynamic server-side features enabled
  // output: 'export', // Commented out to enable API routes
  trailingSlash: true,
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
