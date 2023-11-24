import HtmlWebpackPlugin from 'html-webpack-plugin'
import * as path from 'path'
import * as url from 'url'
import { Configuration } from 'webpack'
import 'webpack-dev-server'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

export function webpackConfig(): (
  _env: unknown,
  argv: { mode: Configuration['mode'] },
) => Configuration {
  return (_env, argv) => {
    const prod = argv.mode !== 'development'
    const mode = prod ? 'production' : 'development'

    return {
      stats: 'minimal',
      mode,
      entry: './src/index.tsx',
      devtool: prod
        ? 'source-map'
        : 'eval-cheap-module-source-map',
      output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        clean: true,
        publicPath: '',
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
          filename: prod
            ? 'index.[contenthash].html'
            : 'index.html',
          template: path.join(
            url.fileURLToPath(
              new URL('.', import.meta.url),
            ),
            './index.html',
          ),
        }),
        new WebpackManifestPlugin({}),
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
}
