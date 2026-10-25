import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    'baseUrl': 'http://localhost:4200',
  },
  reporterOptions: {
    mochaFile: 'e2e/test-results/TEST-[hash].xml',
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
