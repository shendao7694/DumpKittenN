class ServerConsole {
    name = "";
    subName = "";

    constructor(subName = undefined, name = "Server") {
        this.name = name;
        this.subName = subName;
    }

    #time() {
        const d = new Date();
        const date = `${d.getMonth() + 1}/${d.getDate()}`;
        const time = d.toLocaleTimeString('zh-CN', { hour12: false });
        return `${date} ${time}`;
    }

    #tag() {
        return this.subName
            ? `[${this.name}][${this.subName}]`
            : `[${this.name}]`;
    }

    /**
     * Log into console
     * @param {string} msg Log Message
     */
    log(msg) {
        console.log(
            `\x1b[32m[INFO ${this.#time()}]\x1b[0m ` +
            `\x1b[36m${this.#tag()}\x1b[0m ` +
            `${msg}`
        );
    }

    /**
     * Warn into console
     * @param {string} msg Warn Message
     */
    warn(msg) {
        console.warn(
            `\x1b[33m[WARN ${this.#time()}]\x1b[0m ` +
            `\x1b[36m${this.#tag()}\x1b[0m ` +
            `\x1b[33m${msg}\x1b[0m`
        );
    }

    /**
     * Error into console
     * @param {string} msg Error Message
     */
    error(msg) {
        console.error(
            `\x1b[31m[ERROR ${this.#time()}]\x1b[0m ` +
            `\x1b[36m${this.#tag()}\x1b[0m ` +
            `\x1b[31m${msg}\x1b[0m`
        );
    }

    /**
     * Debug into console
     * @param {string} msg Debug Message
     */
    debug(msg) {
        console.log(
            `\x1b[44m\x1b[97m[DEBUG ${this.#time()}]\x1b[0m ` +
            `\x1b[35m${this.#tag()}\x1b[0m ` +
            `\x1b[33m${msg}\x1b[0m`
        );
    }
}

globalThis.ServerConsole = ServerConsole;