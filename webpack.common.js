const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const cssnano = require('cssnano')

const mode = process.env.NODE_ENV || 'production'

const sourceDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')

const isProd = mode === 'production'
const prodPlugins = [new ImageminPlugin({ test: /\.(jpeg|png|gif|svg)$/i })]

module.exports = {
  mode,
  devtool: 'source-map',
  entry: path.join(sourceDir, 'entry.js'),
  output: {
    filename: isProd ? 'bundle.[chunkhash].js' : './bundle.js',
    path: buildDir,
    publicPath: '/',
  },
  resolve: {
    alias: {
      '~constants': `${sourceDir}/js/constants`,
      '~managers': `${sourceDir}/js/managers`,
      '~utils': `${sourceDir}/js/utils`,
      '~shaders': `${sourceDir}/js/shaders`,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
          isProd
            ? {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: () => [postcssPresetEnv(), cssnano()],
                },
              }
            : null,
          'sass-loader',
        ].filter(Boolean),
      },
      {
        test: /\.(glb|gltf|obj)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'models/[name].[ext]' },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'fonts/[name].[ext]' },
          },
        ],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        use: ['webpack-glsl-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'ignore-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Threejs boilerplate',
      template: path.join(sourceDir, 'views/index.html'),
      filename: path.join(buildDir, 'index.html'),
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(sourceDir, 'img'),
        to: 'img',
      },
    ]),
    new MiniCssExtractPlugin({
      filename: isProd ? '[name].[chunkhash].css' : '[name].css',
      chunkFilename: '[id].css',
      fallback: 'style-loader',
      use: [{ loader: 'css-loader', options: { minimize: isProd } }],
    }),
  ].concat(isProd ? prodPlugins : []),
}
