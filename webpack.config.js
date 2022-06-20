// module.exports = {
//     //entry point
//     entry: './src/app.js',

//     //output point
//     output: {
//         path: 'dist',
//         filename: 'bundle.js'
//     }
// };

var path = require('path');

module.exports = {
    mode: 'development',
    //entry: './main.ts',
    entry: path.resolve(__dirname, './src/app.js'),
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        rules: [
            { test: /.ts$/, loader: 'ts-loader' }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        fallback: {
            "fs": false,
        },
    }
};