/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This ensures the `canvas` package is not bundled on the client-side
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }

    // Add a rule to handle .node files using `node-loader`
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    return config;
  },
};

export default nextConfig;
