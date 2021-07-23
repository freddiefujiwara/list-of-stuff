module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/list-of-stuff/'
  : '/',
  configureWebpack: {
    devtool: 'source-map'
  }
}
