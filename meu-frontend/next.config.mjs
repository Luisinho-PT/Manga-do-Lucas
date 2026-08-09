/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseOrigin = '';
let supabaseWebSocketOrigin = '';
try {
  if (supabaseUrl) {
    const parsed = new URL(supabaseUrl);
    supabaseOrigin = parsed.origin;
    supabaseWebSocketOrigin = `wss://${parsed.host}`;
  }
} catch {
  // A validação completa continua sendo feita ao inicializar o cliente.
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.discordapp.com https://lh3.googleusercontent.com",
  "media-src 'self' https://res.cloudinary.com",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWebSocketOrigin}`.trim(),
  "worker-src 'self' blob:",
].join('; ');

const nextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async redirects() {
    return [
      { source: '/history', destination: '/historia', permanent: true },
      { source: '/characters', destination: '/personagens', permanent: true },
      { source: '/characters/:nome', destination: '/personagens/:nome', permanent: true },
      { source: '/chapters', destination: '/historia', permanent: true },
      { source: '/capitulos', destination: '/historia', permanent: true },
      { source: '/about', destination: '/sobre', permanent: true },
    ];
  },

  // Proxy: redireciona chamadas /api/* para o backend Express em localhost:3001
  // Isso permite usar ngrok apenas no frontend (porta 3000)
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  async headers() {
    const privateMediaHeaders = [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ];
    const securityHeaders = [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, noimageindex, nosnippet' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'same-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), display-capture=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/img/:path*', headers: privateMediaHeaders },
      { source: '/audio/:path*', headers: privateMediaHeaders },
    ];
  },

  // Permite dev origins do ngrok (Next.js 16+ exige isso)
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok.io'],
};

export default nextConfig;
