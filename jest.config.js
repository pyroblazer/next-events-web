const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const esmPackages = ['query-string', 'decode-uri-component', 'split-on-first', 'filter-obj']

module.exports = async () => {
  const config = await createJestConfig({
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  })()
  // next/jest ignores all node_modules; let SWC transform the ESM-only packages we import
  config.transformIgnorePatterns = [`/node_modules/(?!(${esmPackages.join('|')})/)`, '^.+\.module\.(css|sass|scss)$']
  return config
}
