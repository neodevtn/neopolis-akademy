/**
 * Lighthouse CI Configuration
 * Runs automated performance audits against the deployed site
 * 
 * Usage:
 *   pnpm lighthouse        # Run audit against production
 *   pnpm lighthouse:local  # Run audit against local dev server
 */
module.exports = {
  ci: {
    collect: {
      // URLs to audit - production domain
      url: [
        process.env.LHCI_URL || 'https://akademy.neodev.click/',
        process.env.LHCI_URL ? `${process.env.LHCI_URL}/training` : 'https://akademy.neodev.click/training',
      ],
      numberOfRuns: 3, // Run 3 times for median scores
      settings: {
        // Use mobile emulation (default Lighthouse behavior)
        preset: 'desktop',
        // Skip network throttling in CI for faster runs
        throttlingMethod: 'simulate',
        // Categories to audit
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        // Performance thresholds - warn if below, error if critically low
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        // Core Web Vitals assertions
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      // Store results locally as JSON reports
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
