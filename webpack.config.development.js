var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// Webpack Config
var webpackConfig = {
  entry: {
    'main': ['./src/main_localhost.browser.ts'],
  },
  //,
  output: {
    path: './dist'
    // publicPath: "/"
  },


  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      chunksSortMode: 'dependency'
    }),
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: require('./src/vendor-manifest.json')
    }),
    new webpack.NoErrorsPlugin(),
    //new webpack.optimize.CommonsChunkPlugin({ name: ['main'], minChunks: Infinity }), // , 'vendor', 'polyfills'
    new webpack.ProvidePlugin({
      web3: "web3"
    })
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
      { test: /\.html$/, loader: 'raw-loader' },
      // copy those assets to output
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file?name=fonts/[name].[hash].[ext]?',
        exclude: [/node_modules/,/vendor/,/polyfills/]
      }
    ]
  }

};


// Our Webpack Defaults
var defaultConfig = {
  devtool: 'cheap-module-source-map', //cheap-module-source-map
  cache: true,
  output: {
    filename: '[name].[hash].bundle.js',
    sourceMapFilename: '[name].[hash].map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    alias: {
      jquery: "jquery/src/jquery",
      app: 'src/app'
    },

    extensions: ['.ts', '.js','.html','.scss'] //'',
  },

  devServer: {
    historyApiFallback: true
    //watchOptions: { aggregateTimeout: 300, poll: 1000 }
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
