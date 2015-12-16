var webpack = require('webpack');

module.exports = {
  entry: './ui/main.js',
  output: {
    path: './static',
    publicPath: '/static/',
    filename: 'main.js'
  },
  plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        // excluding some local linked packages.
        // for normal use cases only node_modules is needed.
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  },
  babel: {
    presets: ['react', 'es2015'],
    plugins: ['transform-runtime']
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
} else {
  module.exports.devtool = '#source-map'
}
