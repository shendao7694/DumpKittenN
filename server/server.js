const http = require('http');
const fs = require('fs');
const path = require('path');
const ServerService = require('./service');
const config = require('./settings/config');


const HANDLE_TYPE  = {
    FILE: 'file',
    EVAL: 'eval',
};

const PRIVATE_MSG = {
    NO_ESPECIALL: 'no_especiall',
    ESPECIALL: 'especiall'
};

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.htm':  'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.mjs':  'text/javascript; charset=utf-8',
    '.cjs':  'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map':  'application/json; charset=utf-8',
    '.wasm': 'application/wasm',
    '.xml':  'application/xml; charset=utf-8',
    '.txt':  'text/plain; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.webp': 'image/webp',
    '.bmp':  'image/bmp',
    '.ogg':  'audio/ogg',
    '.oga':  'audio/ogg',
    '.m4a':  'audio/mp4',
    '.mp3':  'audio/mpeg',
    '.wav':  'audio/wav',
    '.flac': 'audio/flac',
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.otf':  'font/otf',
};

function contentType(filePath) {
    return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

class ServerHub {
    constructor() {
        this.loadingUtil(() => {
            this.createServer();
            this.ServerService = new ServerService();
        })
    }

    /**
     * Loading Util
     * @param {function () : void} after After Function
     */
    loadingUtil(after = () => {}) {
        const utils = [
            './util/console'
        ]

        for(const path of utils) {
            require(path);
        }

        after();
    }

    /**
     * Create A Http Server
     * @returns {void}
     */
    createServer() {
        const port = config.server.port;
        this.console = new ServerConsole("Hub");

        this.httpServer = http.createServer((req, res) => {
            this.onAccess(req, res);
        }).listen(port, "0.0.0.0");

        this.console.log(`Server Starting at \x1b[94mhttp://0.0.0.0:${port}\x1b[0m`);
    }

    /**
     * Web on Access handle function
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse<http.IncomingMessage>} res
     */
    onAccess(req, res) {
        // 在响应真正发送完成后再打印日志，确保 res.statusCode 是最终值
        res.on('finish', () => {
            this.console.log(
                `\x1b[34m'${req.url}'\x1b[0m [\x1b[33m${res.statusCode}\x1b[0m] ` +
                `- \x1b[32m[${req.method}]\x1b[0m from ` +
                `\x1b[94m${req.socket.remoteAddress}:${req.socket.remotePort}\x1b[0m`
            );
        });

        const msg = this.handleEspeciall(req, res);
        if (msg !== PRIVATE_MSG.NO_ESPECIALL) return;

        let urlPath;
        try {
            urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch (e) {
            res.writeHead(400); res.end('Bad Request'); return;
        }

        if (urlPath.includes("..")) {
            res.writeHead(403); res.end(config.server.codeReturns[403]); return;
        }

        if (urlPath.endsWith('/')) urlPath += 'index.html';

        const filePath = path.join(config.server.publicPath, urlPath);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end(config.server.codeReturns[404]);
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType(filePath) });
            res.end(data);
        });
    }

    /**
     * Web on Access handle especiall function
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse<http.IncomingMessage>} res
     */
    handleEspeciall(req, res) {
        const handlePath = [
            {
                type: HANDLE_TYPE.FILE,
                path: "/",
                to: "index.html"
            },
        ];

        const { url } = req;
        var isEspeciall = false;

        for(const idx in handlePath) {
            const handleData = handlePath[idx];
            switch(handleData.type) {
                case HANDLE_TYPE.FILE: {
                    const pathData = handleData.path;
                    const toData = handleData.to;
                    if(pathData != url) break;
                    const filePath = path.join(config.server.publicPath, toData);
                    fs.readFile(filePath, (err, data) => {
                        if(err) { res.writeHead(404); res.end(config.server.codeReturns[404]); return; }
                        res.writeHead(200, { 'Content-Type': contentType(filePath) });
                        res.end(data);
                    })
                    isEspeciall = true;
                    break;
                };

                case HANDLE_TYPE.EVAL: {
                    const pathData = handleData.path;
                    const toData = handleData.to;
                    if(pathData != url) break;
                    toData(req, res);
                    isEspeciall = true;
                }
            }
        }

        if(isEspeciall) {
            return PRIVATE_MSG.ESPECIALL;
        } else {
            return PRIVATE_MSG.NO_ESPECIALL;
        }

    }
}

module.exports = ServerHub;