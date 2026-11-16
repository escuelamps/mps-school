export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/student/',
          '/teacher/',
          '/api/',
          '/checkout/',
          '/login/',
          '/pagos/',
        ],
      },
    ],
    sitemap: 'https://escuelamps.com/sitemap.xml',
  };
}
