/**
 * @typedef {import('./routeMetadata.js')} RouteMetadata
 */

/**
 * RouteMap is the mapping table of a controller class
 */
module.exports = class RouteMap {

    /**
     * @type {Map<string, Set<RouteMetadata>>}
     */
    #patterns = new Map();

    constructor() {


    }

    /**
     * 
     * @param {string} _pattern 
     * @returns {boolean}
     */
    has(_pattern) {

        return this.#patterns.has(_pattern);
    }

    /**
     * 
     * @param {string} _pattern 
     * @returns {Set<RouteMetadata>}
     */
    get(_pattern) {

        return this.#patterns.get(_pattern) ?? [];
    }

    /**
     * 
     * @param {string} _pattern 
     * @param {RouteMetadata} _routeMeta 
     * @returns {boolean}
     * 
     * @throws {TypeError}
     */
    map(_pattern, _routeMeta) {

        if (typeof _pattern !== 'string') {

            throw new TypeError('_pattern must be a string');
        }

        const allMapped = this.#patterns;

        if (!allMapped.has(_pattern)) {

            allMapped.set(_pattern, new Set());
        }

        allMapped.get(_pattern).add(_routeMeta);

        return true;
    }
}