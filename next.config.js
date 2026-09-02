/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API hooks for external services — uncomment when ready
  // async rewrites() {
  //   return [
  //     { source: '/api/py/forecast/:path*', destination: 'http://localhost:8001/:path*' },
  //     { source: '/api/py/optimize/:path*', destination: 'http://localhost:8002/:path*' },
  //     { source: '/api/py/telemetry/:path*', destination: 'http://localhost:8003/:path*' },
  //   ];
  // },
};

module.exports = nextConfig;
