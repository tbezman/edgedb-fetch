/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    swcPlugins: [
      [
        "/Users/terence/Code/edgedb-stuff/my-first-plugin/target/wasm32-wasi/debug/my_first_plugin.wasm",
        {},
      ],
    ],
  },
};

module.exports = nextConfig;
