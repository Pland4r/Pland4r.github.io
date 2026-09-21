/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` emits a plain ./out folder you can host
  // on Vercel, Netlify, GitHub Pages, or any cheap shared host.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
