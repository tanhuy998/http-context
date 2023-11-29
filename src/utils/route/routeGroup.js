const isIterable = require('reflectype/src/utils/isIterable.js');
const express = require('express');
const { generateInternalHandler, generatRouteGroupHandler } = require('../../expressHandler');

/**
 * @typedef {import('../../controller/httpController.js')} HttpController
 */

module.exports = class RouteGroup {

    /**@type {Set<string>} */
    #prefixes;

    /**@type {Array<Function>} */
    #middleware;

    /**@type {typeof HttpController} */
    #controllerClass;

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
     * @param {typeof HttpController} _ControllerClass 
     */
    setController(_ControllerClass) {

        this.#controllerClass = _ControllerClass;
    }

    mountGroup(_controllerRouter) {

        const groupRouter = express.Router();

        const ControllerClass = this.#controllerClass;
        
        for (const prefix of this.#prefixes.values()) {
            
            const group = express.Router();

            group.use(prefix, generatRouteGroupHandler(ControllerClass));
            group.use(prefix, _controllerRouter);

            groupRouter.use(group);
        }

        return groupRouter;
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