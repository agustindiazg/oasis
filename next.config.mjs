/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: process.cwd(),
  async redirects() {
    return [{ source: "/brand", destination: "/marca", permanent: false }];
  },
};

export default nextConfig;
