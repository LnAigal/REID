import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.ts', '!main.ts', '!**/*.module.ts', '!**/*.dto.ts', '!**/*.guard.ts', '!**/*.strategy.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@repo/shared$': '<rootDir>/../../packages/shared/src',
  },
};

export default config;
