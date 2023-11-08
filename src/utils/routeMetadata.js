const {addVerb, hasVerb} = require('./httpMethodEncoding.js');
module.exports = class RouteMetadata {

    /**@type {Map<string, number>} */
    #map = new Map();

    #func;

    /**@returns {Map<string, number>} */
    get all() {

        return this.#map;
    }

    get mappedFunction() {

        return this.#func;
    }

    constructor(_func) {

        if (typeof _func !== 'function') {

            throw new TypeError('_func must a function')
        }

        this.#func = _func;
    }

    /**
     * 
     * @param {string} _verb 
     * @param {string} _pattern 
     */
    set(_verb, _pattern) {

        const map = this.#map;

        const storedVerbChain = map.has(_pattern) ? map.get(_pattern) : 0;
        
        const newVerbChain = addVerb(_verb, storedVerbChain);
        
        map.set(_pattern, newVerbChain);
    }

    /**
     * 
     * @param {string} _pattern 
     * @param {string | number} _verb 
     * @returns {boolean}
     * 
     * @throws {TypeError}
     */
    match(_pattern, _verb) {

        if (typeof _pattern !== 'string') {

            throw new TypeError('_pattern must be a string');
        }

        const verbChain = this.#map.get(_pattern);

        if (typeof verbChain != 'number') {

            return false;
        }

        return hasVerb(_verb, verbChain);
    }
}