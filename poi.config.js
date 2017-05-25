const webpack = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

module.exports = options => ({
  entry: 'src/index.js',
  port: 3000,
  webpack(config) {
    // Remove unnecessary Moment.js locales from bundle
    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
    // Analyze dependency size if there's a --stats flag
    if (options.stats) {
      config.plugins.push(new BundleAnalyzerPlugin())
    }
    return config
  },
  autoprefixer: {
    browsers: ['> 1%']
  },
  html: {
    template: 'src/index.html',
    minify: {
      collapseWhitespace: true
    }
  },
  // Don't split code into separate bundles
  vendor: false
})
