const BaseController = require("./baseController");
const express = require('express');
const {getRegisteredMethods, getRoute} = require('../utils/route/httpRoute.js');
const RouteMetadata = require("../utils/route/routeMetadata.js");
const self = require('reflectype/src/utils/self.js');
const {convertToVerbList} = require('../utils/httpMethodEncoding.js');
const RouteMap = require("../utils/route/routeMap.js");

const {generateExpressHandler, generateInternalHandler} = require('../expressHandler.js');
const { hasControllerMetadata } = require("../utils/requestMetadata.js");
const { getControllerRouteGroup } = require("../utils/route/route.utils.js");
const { BASE_HTTP_CONTROLLER, CONFIGURATION, SUB_CLASS_ID } = require("./constant.js");
const HttpControllerConfiguration = require("../configuration/httpController/httpControllerConfiguration.js");
const HttpControllerRouterStrategy = require("../configuration/httpController/httpControllerRouterStrategy.js");
const HttpControllerConfigurator = require("../configuration/httpController/httpControllerConfigurator.js");

/**
 * @typedef {import('../httpContext.js')} HttpContext
 */

const proto = module.exports = class HttpController extends BaseController {

    static get id() {
        
        this._initPerSubClassId();
        
        return this[SUB_CLASS_ID];
    }


    /**@type {HttpControllerConfiguration} */
    static get configuration() {

        const configuration = this[CONFIGURATION];
        
        if (configuration instanceof HttpControllerConfiguration) {

            return configuration;
        }

        return this[CONFIGURATION] = new HttpControllerConfiguration(this);
    }

    static _initPerSubClassId() {

        const fieldName = SUB_CLASS_ID;

        const descriptor = Object.getOwnPropertyDescriptor(this, fieldName);
        
        if (!descriptor?.configurable && 
            !descriptor?.writable && 
            typeof descriptor?.value === 'symbol') {

                return;
        }
        
        Object.defineProperty(this, fieldName, {
            configurable: false,
            writable: false,
            enumerable: true,
            value: Symbol(this.name)
        });
    }

    static _init() {
        
        this._initPerSubClassId();
        
        new HttpControllerConfigurator(this).mount();

        if (this.isLock === true) {

            return;
        }

        Object.defineProperty(this, 'isLocked', {
            configurable: false,
            enumerable: true,
            writable: false,
            value: false
        })
    }

    static serve() {

        this._init();

        return this.configuration.getIndependentRouter(this);
    }

    // /**
    //  * For static call handling without pipeline
    //  * 
    //  * @type {express.Router}
    //  */
    // static expressRouter = undefined;

    // static featureRouter;

    // /**
    //  * For handling inside a pipeline
    //  */
    // /**@type {express.Router} */
    // static internalRouter = undefined;

    // /**@type {RouteMap} */
    // static routeMap;

    // /**@type {Symbol} */
    // static perSubClassId;

    // static routeRegex;

    // static get filterRouter() {

    //     if (!this.internalRouter) {

    //         this._init();
    //     }
        
    //     const routeGroup = getControllerRouteGroup(this);

    //     return routeGroup?.mountGroup(this.internalRouter) ?? this.internalRouter;
    // }

    // static get router() {

    //     if (!this.expressRouter) {

    //         this._init();
    //     }

    //     const routeGroup = getControllerRouteGroup(this);

    //     return routeGroup?.mountGroup(this.expressRouter) ?? this.expressRouter;
    // }

    // static get feature() {

    //     if (!this.featureRouter) {

    //         this._init();
    //     }

    //     return this.featureRouter;
    // }

    // static serve() {

    //    return this.router;
    // }

    // static _init() {
        
    //     if (this.expressRouter !== undefined || this.internalRouter !== undefined) {

    //         return;
    //     }

    //     this.expressRouter = express.Router();

    //     this.internalRouter = express.Router();

    //     this.featureRouter = {
    //         before: express.Router(),
    //         after: express.Router()
    //     };

    //     //this.id = typeof this.id === 'symbol' ? this.id : Symbol(this.name);

    //     this._initPerSubClassId();

    //     this.initRouteMap();

    //     this.registerRoutes();
    // }

    // static initRouteMap() {

    //     this.routeMap = new RouteMap();
    // }

    // /**
    //  * setups route that declared on each method except route group
    //  * 
    //  * @returns 
    //  */
    // static registerRoutes() {

    //     const exprRouter = this.expressRouter;
    //     const internalRouter = this.internalRouter;
    //     const routeMap = this.routeMap;

    //     if (!exprRouter) {

    //         return;
    //     }

    //     const methods = getRegisteredMethods(this);
        
    //     for (const fn of methods || []) {
            
    //         const route = getRoute(fn);

    //         for (const entry of route.all.entries()) {
                
    //             const [pattern, verbChain] = entry;
                
    //             if (typeof pattern !== 'string' || typeof verbChain !== 'number') {

    //                 continue;
    //             }

    //             routeMap.map(pattern, route);                

    //             const verbList = convertToVerbList(verbChain);
                
    //             for (const verb of verbList || []) {
                    
    //                 exprRouter[verb](pattern, generateExpressHandler(this, pattern));
    //                 internalRouter[verb](pattern, generateInternalHandler(this, pattern));
    //             }               
    //         }
    //     }
    // }

    /**
     * PROTOTYPE AREA
     */

    #handlingProgress;

    /**@type {HttpContext} */
    get httpContext() {

        return super.context;
    }

    /**@type {HttpControllerConfiguration} */
    get configuration() {

        return self(this).configuration;
    }

    handle() {
        
        try {
            
            if (!this.#requestMatch()) {

                return;
            }
            
            /**
             * using RouteMap to get the exact method for handling the current route;
             */
    
            this.#resolve();
            
            return this.#handlingProgress;
        }
        catch(e) {

            
        }
    }

    #requestMatch() {

        const req = this.httpContext.request;
        
        return hasControllerMetadata(req, this);
    }

    #resolve() {

        const methods = this.#resolveRoutesMetadata();
        
        return this.#treat(methods.values());
    }

    /**
     * 
    */
    #resolveRoutesMetadata() {

        const req = this.httpContext.request;

        /**@type {RouteMap} */
        const routeMap = this.configuration.routeMap;

        /**@type {string} */
        const currentRoutePattern = req.route.path;

        const metadatas = routeMap.get(currentRoutePattern);

        return this.#mapRouteMetadataToMethods(metadatas);
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

            lastHandledValue = fn.call(this);
            
            if (lastHandledValue instanceof Promise) {

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

            const methodName = routeMeta.mappedMethodName;
            const fn = this[methodName];
            
            if (typeof fn === 'function') {

                ret.push(fn);
            }
        }
        
        return ret;
    }

    /**
     * 
     * @param {string} _view 
     * @param {_variables} _variables 
     * 
     * @returns {ViewResult}
     */
    render(_view, _variables) {

    }

    /**
     * 
     * @param {string} _url 
     * 
     * @returns {RedirectResult}
     */
    redirect(_url) {


    }

    download() {


    }

    file() {


    }
}


Object.defineProperty(proto, 'base', {
    configurable: false,
    writable: false,
    enumerable: true,
    value: BASE_HTTP_CONTROLLER
});
