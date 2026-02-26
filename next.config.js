/** @type {import('next').NextConfig} */
// RENDER_DEPLOY_FORCE: 2026-02-26T10:40:00+01:00
const nextConfig = {
    reactStrictMode: true,
    // Ensure that we can use the python_engine if needed, or other assets
    serverExternalPackages: ['@prisma/client'],
};

module.exports = nextConfig;
