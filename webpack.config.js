const path = require('path');

const sourcePath = path.resolve(__dirname, 'src/main/');

const devMode = process.env.NODE_ENV !== 'production';
const fileNameSuffix = devMode ? '-dev' : '.[contenthash]';
const filename = `[name]${fileNameSuffix}.js`;

module.exports = {
  entry: path.resolve(sourcePath, 'index.js') ,
  mode: devMode ? 'development': 'production',
  output: {
    path: path.resolve(__dirname, 'src/main/public/'),
    publicPath: '',
    filename,
  },
};
