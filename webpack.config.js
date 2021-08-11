const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;


const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    }
  }

  if (isProd) {
    config.minimizer = [
      new CssMinimizerPlugin(),
      new TerserPlugin({
          parallel: true,
      }),
      new ImageMinimizerPlugin({
        minimizerOptions: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["mozjpeg", { progressive: true }],
            ["pngquant", { quality: [0.65, 0.8], speed: 10 }],
            ["svgo"],
            ["imagemin-webp"],
          ]
        }
      }),
    // TO DO: png to webp
    // new ImageMinimizerPlugin({
    //   test: /\.(png)$/i,
    //   deleteOriginalAssets: true,
    //   filename: "[path]/[name].webp",
    //   minimizerOptions: {
    //     plugins: ["imagemin-webp"],
    //   },
    // }),
    ]
  }
  return config
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: isDev ? 'eval-cheap-module-source-map' : false,
  mode: isDev ? 'development' : 'production',
  entry: {
    main: './index.js',
    l1: './landings/l1/index.js',
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: '[path][name].[hash][ext]',
  },
  target: isDev ? 'web' : 'browserslist', //TO DO: temporary solution for live reload. delete when webpack-dev-server will be 4 version
  optimization: optimization(),
  devServer: {
    port: 3000,
    compress: true,
    overlay: true,
    open: true,
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      images: path.resolve(__dirname, 'src/assets/images'),
      fonts: path.resolve(__dirname, 'src/assets/fonts'),
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
      template: './landings/l1/index.pug',
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: isProd,
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff2?|ttf)$/i,
        type: 'asset/resource',
      },
    ]
  }
}

// // let a;
// // let b = { ...a, output:[] };