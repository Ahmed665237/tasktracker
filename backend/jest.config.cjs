module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.ts$": "babel-jest",
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testMatch: [
    "**/*.test.ts",
  ],

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageReporters: [
    "text",
    "html",
  ],

  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
    },
  },
};