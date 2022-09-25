module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    PUBLIC_API: `${process.env.PUBLIC_HOST}`,
    LOCAL_API: `${process.env.LOCAL_HOST}`
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  useFileSystemPublicRoutes: true,
  pageExtensions: ['tsx'],
  webpack: (config) => config,
  async redirects() {
    return [];
  }
};
