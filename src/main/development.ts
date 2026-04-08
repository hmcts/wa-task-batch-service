import * as express from 'express';

const setupDev = (app: express.Express, developmentMode: boolean): void => {
  if (developmentMode) {
    import webpackDev from 'webpack-dev-middleware';
    import webpack from 'webpack';
    import webpackconfig from '../../webpack.config';
    const compiler = webpack(webpackconfig);
    app.use(webpackDev(compiler, {
      publicPath: '/',
    }));
  }
};

module.exports = { setupDev };
