module.exports = {
  roots: ['<rootDir>/src/test/unit'],
  "testRegex": "(/src/test/.*|\\.(test|spec))\\.(ts|js)$",
   "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "testEnvironment": "node",
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.js$': ['babel-jest', {
      presets: [['@babel/preset-env', {targets: {node: 'current'}, modules: 'commonjs'}]],
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/(?!(?:@scure/base|@noble/hashes|@otplib/plugin-crypto-noble/node_modules/@noble/hashes)/)'],
}
