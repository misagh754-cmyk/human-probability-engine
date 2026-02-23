/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Ensure that we can use the python_engine if needed, or other assets
    serverExternalPackages: ['@prisma/client'],
};

module.exports = nextConfig;
