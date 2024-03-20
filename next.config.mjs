// import {withSentryConfig} from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const cspHeader = `
    default-src 'self';
    script-src 'self';
    style-src 'self';
    img-src 'self' blob:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    require-trusted-types-for 'script';
`

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
}

// export default withSentryConfig(nextConfig, {
// // For all available options, see:
// // https://github.com/getsentry/sentry-webpack-plugin#options

// // Suppresses source map uploading logs during build
// silent: true,
// org: "ka-ngai",
// project: "webshop-nextjs",
// }, {
// // For all available options, see:
// // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// // Upload a larger set of source maps for prettier stack traces (increases build time)
// widenClientFileUpload: true,

// // Transpiles SDK to be compatible with IE11 (increases bundle size)
// transpileClientSDK: true,

// // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers. (increases server load)
// // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// // side errors will fail.
// tunnelRoute: "/monitoring",

// // Hides source maps from generated client bundles
// hideSourceMaps: true,

// // Automatically tree-shake Sentry logger statements to reduce bundle size
// disableLogger: true,

// // Enables automatic instrumentation of Vercel Cron Monitors.
// // See the following for more information:
// // https://docs.sentry.io/product/crons/
// // https://vercel.com/docs/cron-jobs
// automaticVercelMonitors: true,
// });