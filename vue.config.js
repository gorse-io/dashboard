/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const sass = require('sass');

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    resolve: {
      alias: {
        vue$: require.resolve('vue/dist/vue.runtime.esm-bundler.js'),
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        implementation: sass,
        sassOptions: {
          includePaths: [path.join(__dirname, 'node_modules')],
        },
      },
      scss: {
        implementation: sass,
        sassOptions: {
          includePaths: [path.join(__dirname, 'node_modules')],
        },
      },
    },
  },
  devServer: {
    proxy: 'https://play.gorse.io',
  },
};
