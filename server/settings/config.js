const path = require('path');

module.exports = {
    server: {
        port: 80,
        codeReturns: {
            404: "Not Found",
            403: "Forbidden"
        },
        publicPath: path.join(__dirname, '../', '../', 'client')
    }
}