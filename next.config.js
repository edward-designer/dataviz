/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  sw: "service-worker.js",
});

const nextConfig = {};

module.exports = nextConfig;
