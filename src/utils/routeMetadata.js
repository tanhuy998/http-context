module.exports = class RouteMetadata {

    /**@type {Map<string, Set<string>>} */
    #map = new Map();

    /**@returns {Map<string, Set<string>>} */
    get all() {

        return this.#map;
    }

    set(_verb, _pattern) {

        const map = this.#map;

        if (!map.has(_pattern)) {

            map.set(_pattern, new Set());
        }

        const set = map.get(_pattern);

        set.add(_verb);
    }
}