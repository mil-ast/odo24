var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: [
      './src/index.js'
    ],
    output: {
        path: __dirname + '/dist',
        filename: 'app.bundle.js'
      },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            minify : {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true
            },
            template: './public/index.html',
            filename: './index.html'
        })
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    devServer: {
      //contentBase: './dist'
    }
  };