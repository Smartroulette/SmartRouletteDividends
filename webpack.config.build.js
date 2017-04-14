var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const METADATA = {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: false
};

// Webpack Config
var webpackConfig = {
  entry: {
    'polyfills': './src/polyfills.browser.ts',
    'vendor':    './src/vendor.browser.ts',
    'main':       ['./src/main.browser.ts'] //'bootstrap-loader'
  },

  output: {
    path: '../dist'
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index_prod.html',
      chunksSortMode: 'dependency'
    }),
    new webpack.optimize.CommonsChunkPlugin({ name: ['main', 'vendor', 'polyfills'], minChunks: Infinity }),
    new webpack.ProvidePlugin({
      web3: "web3"
    }),

    new OptimizeJsPlugin({
      sourceMap: false
    }),

    new DefinePlugin({
      'ENV': JSON.stringify(METADATA.ENV),
      'HMR': METADATA.HMR,
      'process.env': {
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
      }
    }),

    new UglifyJsPlugin({
      beautify: false, //prod
      output: {
        comments: false
      }, //prod
      mangle: {
        screw_ie8: true
      }, //prod
      compress: {
        screw_ie8: true,
        warnings: false,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        negate_iife: false // we need this for lazy v8
      },
    }),
    new CopyWebpackPlugin([
      { from: 'src/bootstrap.min.js' },
      { from: 'src/favicon.ico' },
      { from: 'src/bootstrap.min.css' },
      { from: 'src/loading.gif' },
      { from: '**/*', to:'fonts', context: 'src/fonts'}
    ])
  ],

  module: {
    loaders: [
      // .ts files for TypeScript
      { test: /\.ts$/, loaders: ['awesome-typescript-loader', 'angular2-template-loader'],
        exclude: [/node_modules/,/vendor/,/polyfills/]
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/,/vendor/,/polyfills/],
        include: [
          path.resolve(__dirname, "src")
        ],
        loader: 'raw-loader!sass-loader'
      },
      { test: /\.html$/, loader: 'raw-loader' }//,
    ]
  }

};


// Our Webpack Defaults
var defaultConfig = {
  devtool: 'cheap-source-map',
  cache: true,
  output: {
    filename: '[name].[chunkhash].bundle.js',
    sourceMapFilename: '[name].[chunkhash].map',
    chunkFilename: '[id].[chunkhash].chunk.js'
  },

  resolve: {
    // root: [ path.join(__dirname, 'src') ],
    extensions: ['.ts', '.js']
  },

  devServer: {
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 }
  },

  node: {
    global: true,
    crypto: false,//'empty',
    module: false, //0
    Buffer: false,
    clearImmediate: false, //0
    setImmediate: false //0
  }
};

var webpackMerge = require('webpack-merge');
module.exports = webpackMerge(defaultConfig, webpackConfig);
