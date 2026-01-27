
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable image optimization for static-like environments or custom loaders
  images: {
    unoptimized: true,
  },
  // ADD THIS SECTION: CORS and Streaming Headers
  async headers() {
    return [
      {
        // Apply these headers to your LLM streaming route
        source: "/api/v1/llm/stream",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://nighutlabs.dev" }, // Replace with your actual domain
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
}

module.exports = nextConfig
