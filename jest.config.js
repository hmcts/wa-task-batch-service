module.exports = {
  roots: ['<rootDir>/src/test/unit', '<rootDir>/src/test/service'],
  "testRegex": "(/src/test/.*|\\.(test|spec))\\.(ts|js)$",
   "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "testEnvironment": "node",
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/(?!react-dnd|dnd-core|@react-dnd|react-dnd-html5-backend)'],
}
