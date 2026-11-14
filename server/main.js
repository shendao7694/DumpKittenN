const ServerHub = require('./server.js');

function main() {
    globalThis.serverhub = new ServerHub();
}

main();