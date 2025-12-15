import path from 'path';
import { fileURLToPath } from 'url';
import { HtmlRspackPlugin } from '@rspack/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entry: './frontend/src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  devServer: {
    port: 8080,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'frontend/public'),
    },
    proxy: [
      {
        context: ['/api', '/auth'],
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      {
        context: ['/ws'],
        target: 'ws://localhost:3000',
        ws: true,
      }
    ]
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './frontend/public/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/auto', // Явно говорим Rspack, что это современный JS
      },
      {
        test: /\.css$/,
        type: 'css', // Встроенная поддержка CSS
      },
      {
        test: /\.(png|svg|jpg)$/i,
        type: 'asset/resource',
      },
    ],
  },
};