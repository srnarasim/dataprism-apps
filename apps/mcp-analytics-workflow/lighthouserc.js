module.exports = {
  ci: {
    collect: {
      url: ['https://your-username.github.io/dataprism-apps/mcp-analytics-workflow/'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'ready in',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': 'off', // PWA not required for this app
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};