// jest.config.js

module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
        'controllers/**/*.{js,jsx,ts,tsx}',
        'utils/**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
        '!**/vendor/**'
    ],

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // An array of file extensions your modules use
    moduleFileExtensions: [
        'js',
        'jsx',
        'ts',
        'tsx',
        'json',
        'node'
    ],

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // A preset that is used as a base for Jest's configuration
    preset: null,

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '**/__tests__/**/*.js?(x)',
        '**/?(*.)+(spec|test).js?(x)'
    ],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: [
        '\\\\node_modules\\\\'
    ],

    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: [
        'node_modules'
    ],

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '^@controllers/(.*)$': '<rootDir>/controllers/$1',
        '^@utils/(.*)$': '<rootDir>/utils/$1'
    },

    // A map from regular expressions to paths to transformers
    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    // Indicates whether each individual test should be reported during the run
    verbose: true,
};