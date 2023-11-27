const isIterable = require('reflectype/src/utils/isIterable.js');

module.exports = class RouteGroup {

    /**@type {Set<string>} */
    #prefixes;

    /**@type {Array<Function>} */
    #middleware;

    /**@returns {Array<Function>} */
    get middleware() {

        return this.#middleware;
    }

    /**@returns {Array<string>} */
    get prefixes() {

        return Array.from(this.#prefixes);
    }

    /**
     * 
     * @param {string?} _prefix 
     */
    constructor(..._prefixes) {

        this.#prefixes = _prefixes.length > 0 ? new Set(_prefixes) : new Set(['/']);
    }

    /**
     * 
     * @param {Function} _middleware 
     */
    addMiddleware(_middleware) {

        if (!isIterable(this.#middleware)) {

            this.#middleware = [];
        }

        this.#middleware.push(_middleware);
    }

    /**
     * 
     * @param {string} _prefix 
     */
    addPrefix(..._prefixes) {

        for (const pre of _prefixes) {

            this.#prefixes.add(pre);
        }
    }
}