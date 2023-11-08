const {addVerb} = require('./httpMethodEncoding.js');
module.exports = class RouteMetadata {

    /**@type {Map<string, number>} */
    #map = new Map();

    /**@returns {Map<string, number>} */
    get all() {

        return this.#map;
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

        // const map = this.#map;

        // if (!map.has(_pattern)) {

        //     map.set(_pattern, new Set());
        // }

        // const set = map.get(_pattern);

        // set.add(_verb);
    }
}