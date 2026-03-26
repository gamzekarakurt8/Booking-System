import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  moduleNameMapper: {
    "^@booking/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "coverage",
  testEnvironment: "node",
};

export default config;
