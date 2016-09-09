let path = require('path')
let webpack = require('webpack')
let htmlPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'build.js'
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      }
    ]
  },
  babel: {
    presets: ['es2015']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false,
    contentBase: 'dist'
  },
  devtool: '#eval-source-map',
  plugins: [
    new htmlPlugin({
      minify: { collapseWhitespace: true },
      template: 'index.html'
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // Add Google Analytics code during production
  module.exports.entry.push('./src/ga.js')
  // Minify JavaScript
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ])
}
