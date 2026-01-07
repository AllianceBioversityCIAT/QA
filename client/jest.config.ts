import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 30,
      functions: 60,
      lines: 60
    }
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '@public/(.*)': '<rootDir>/public/$1',
    '@shared/(.*)': '<rootDir>/src/app/_shared/$1',
    '@models/(.*)': '<rootDir>/src/app/_models/$1',
    '@services/(.*)': '<rootDir>/src/app/services/$1',
    '@pipes/(.*)': '<rootDir>/src/app/pipes/$1',
    '@directives/(.*)': '<rootDir>/src/app/_directives/$1',
    '@guards/(.*)': '<rootDir>/src/app/_guards/$1',
    '@resolvers/(.*)': '<rootDir>/src/app/_resolvers/$1',
    '@utils/(.*)': '<rootDir>/src/app/utils/$1',
    '@interfaces/(.*)': '<rootDir>/src/app/_interfaces/$1',
    '@enums/(.*)': '<rootDir>/src/app/_enums/$1',
    '@helpers/(.*)': '<rootDir>/src/app/_helpers/$1',
    '@pages/(.*)': '<rootDir>/src/app/pages/$1',
    '@microsoft/clarity': '<rootDir>/src/__mocks__/clarity.mock.ts',
    '@swimlane/ngx-charts': '<rootDir>/src/__mocks__/ngx-charts.mock.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@microsoft/clarity|@swimlane/ngx-charts|ng2-charts|lodash-es|d3-array|d3-scale|d3-selection|d3-shape|d3-time|d3-.*|.*\\.mjs$))'
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts'
  ]
};

export default config;
