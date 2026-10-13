/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the Next.js development indicator (black N)
  devIndicators: false,

  // Existing Tailwind CSS configuration
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;