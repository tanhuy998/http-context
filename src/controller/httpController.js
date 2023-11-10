const BaseController = require("./baseController");
const express = require('express');
const {hasRoute, getRegisteredMethods, getRoute} = require('../utils/httpRoute.js');
const RouteMetadata = require("../utils/routeMetadata.js");
const Context = require("isln/context/index.js");
const HttpContext = require("../httpContext.js");
const self = require('reflectype/src/utils/self.js');
const {convertToVerbList} = require('../utils/httpMethodEncoding.js');
const RouteMap = require("../utils/routeMap.js");

const {generateExpressHandler, generateInternalHandler} = require('../expressHandler.js');
const { getRequestMetadata, hasControllerMetadata } = require("../utils/requestMetadata.js");

/**
 * @typedef {import('../httpContext.js')} HttpContext
 */

module.exports = class HttpController extends BaseController {
    
    /**
     * For static call handling without pipeline
     * 
     * @type {express.Router}
     */
    static expressRouter = undefined;

    static featureRouter;

    /**
     * For handling inside a pipeline
     */
    /**@type {express.Router} */
    static internalRouter = undefined;

    /**@type {RouteMap} */
    static routeMap;

    static id;

    static get filterRouter() {

        if (!this.internalRouter) {

            this._init();
        }

        return this.internalRouter;
    }

    static get router() {

        if (!this.expressRouter) {

            this._init();
        }

        return this.expressRouter;
    }

    static serve() {

       return this.router;
    }

    static _init() {

        this.expressRouter = express.Router();

        this.internalRouter = express.Router();

        this.id = typeof this.id === 'symbol' ? this.id : Symbol(this.name);

        this.initRouteMap();

        this.registerRoutes();
    }

    static initRouteMap() {

        this.routeMap = new RouteMap();
    }

    static registerRoutes() {

        const exprRouter = this.router;
        const internalRouter = this.filterRouter;
        const routeMap = this.routeMap;

        if (!exprRouter) {

            return;
        }

        const methods = getRegisteredMethods(this);

        for (const fn of methods) {

            const route = getRoute(fn);

            for (const entry of route.all.entries()) {
                //console.log(entry)
                const [pattern, verbChain] = entry;
                
                if (typeof pattern !== 'string' || typeof verbChain !== 'number') {

                    continue;
                }

                routeMap.map(pattern, route);                

                const verbList = convertToVerbList(verbChain);
                
                for (const verb of verbList || []) {

                    console.log(verb, pattern);
                    exprRouter[verb](pattern, generateExpressHandler(this, fn));
                    internalRouter[verb](pattern, generateInternalHandler(this, fn.name));
                }
            }
        }
    }

    /**
     * PROTOTYPE AREA
     */

    #handlingProgress;

    /**@type {HttpContext} */
    get httpContext() {

        return super.context;
    }

    handle() {

        // /**@type {express.Router} */
        // const internalRouter = self(this).filterRouter;

        // const r = internalRouter.handle(req, res, () => {});

        if (!this.#requestMatch()) {

            return;
        }

        /**
         * using RouteMap to get the exact method for handling the current route;
         */
        
        this.#resolve();

        return this.#handlingProgress;
    }

    #requestMatch() {

        const req = this.httpContext.request;

        return hasControllerMetadata(req, this);
    }
    #resolve() {

        const methods = this.#resolveRoutesMetadata();
        console.log(methods);

        return this.#treat(methods.values());
    }
    
    /**
     * 
     * @param {Iterator<Function>} _iterator 
     */
    #treat(_iterator) {

        let lastHandledValue;

        let iteration = _iterator.next();

        while (!iteration.done) {
            
            const fn = iteration.value;

            //const handledResult = fn.call(this);

            lastHandledValue = fn.call(this);

            if (handledResult instanceof Promise) {

                return this.#handlingProgress = lastHandledValue.then((function(actionResult) {

                    this.#treat(_iterator);

                }).bind(this)); 
            }
            else {

                iteration = _iterator.next();
            }
        }

        return this.#handlingProgress = lastHandledValue;
    }

    /**
     * 
     */
    #resolveRoutesMetadata() {

        const req = this.httpContext.request;

        /**@type {RouteMap} */
        const routeMap = self(this).routeMap;
        
        /**@type {string} */
        const currentPattern = req.route.path;

        const metadatas = routeMap.get(currentPattern);

        return this.#mapRouteMetadataToMethods(metadatas);
    }

    /**
     * 
     * @param {Set<RouteMetadata>} _meta 
     * 
     * @returns {Array<Function>}
     */
    #mapRouteMetadataToMethods(_meta) {

        /**@type {Array<Function>} */
        const ret = [];

        const httpRequest = this.httpContext.request;
        
        /**@type {string} */
        const httpMethod = httpRequest.method;
        /**@type {string} */
        const reqPattern = httpRequest.route.path;

        for (/**@type {RouteMetadata} */ const routeMeta of _meta?.values() ?? []) {

            if (!routeMeta.match(reqPattern, httpMethod)) {

                continue;
            }

            //console.log(httpMethod, reqPattern)
            const fn = routeMeta.mappedFunction;
            
            if (typeof fn === 'function') {

                ret.push(fn);
            }
        }

        return ret;
    }
}

