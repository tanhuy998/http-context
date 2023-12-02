const ContextLockable = require('isln/src/dependencies/lockable/contextLockable.js');
const {addVerb, hasVerb} = require('../httpMethodEncoding.js');

module.exports = class RouteMetadata extends ContextLockable {

    /**
     * @override
     */
    lockActions = ['set']

    /**@type {Map<string, number>} */
    #map = new Map();

    #func;

    #methodName;

    /**@returns {Map<string, number>} */
    get all() {

        return this.#map;
    }

    get mappedFunction() {

        return this.#func;
    }

    get mappedMethodName() {

        return this.#methodName;
    }

    /**
     * @typedef {Object} LockStateObject
     * @property {boolean} isLocked
     * 
     * 
     * @param {Function} _func 
     * @param {string} _name 
     * @param {LockStateObject} _HttpContext 
     */
    constructor(_func, _name, _HttpContext) {

        super(_HttpContext);

        if (typeof _func !== 'function') {

            throw new TypeError('_func must a function')
        }

        if (typeof _name !== 'string' && typeof _name !== 'symbol') {

            throw new TypeError('_name is not type of string or Symbol');
        }

        this.#methodName = _name;
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