import HtmlWebpackPlugin from 'html-webpack-plugin'
import * as path from 'path'
import * as url from 'url'
import { Configuration } from 'webpack'
import 'webpack-dev-server'

export function webpackConfig(): Configuration {
  return {
    stats: 'minimal',
    mode: 'development',
    entry: './src/index.tsx',
    devtool: 'eval-cheap-module-source-map',
    output: {
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName:
                    '[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-preset-env']],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.glsl$/,
          type: 'asset/source',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(
          url.fileURLToPath(new URL('.', import.meta.url)),
          './index.html',
        ),
      }),
    ],
    devServer: {
      hot: false,
      watchFiles: ['./src/index.html'],
      historyApiFallback: true,
      allowedHosts: ['.amazonaws.com', '.slg.dev'],
      client: {
        webSocketURL: 'auto://0.0.0.0:0/ws',
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  }
}
