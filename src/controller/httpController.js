const BaseController = require("./baseController");
const express = require('express');
const {getRegisteredMethods, getRoute} = require('../utils/route/httpRoute.js');
const RouteMetadata = require("../utils/route/routeMetadata.js");
const HttpContext = require("../httpContext.js");
const self = require('reflectype/src/utils/self.js');
const {convertToVerbList} = require('../utils/httpMethodEncoding.js');
const RouteMap = require("../utils/route/routeMap.js");

const {generateExpressHandler, generateInternalHandler} = require('../expressHandler.js');
const { hasControllerMetadata } = require("../utils/requestMetadata.js");
const { getControllerRouteGroup } = require("../utils/route/route.utils.js");

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

    /**@type {Symbol} */
    static id;

    static routeRegex;

    static get filterRouter() {

        if (!this.internalRouter) {

            this._init();
        }
        
        const routeGroup = getControllerRouteGroup(this);

        return routeGroup?.mountGroup(this.internalRouter) ?? this.internalRouter;
    }

    static get router() {

        if (!this.expressRouter) {

            this._init();
        }

        const routeGroup = getControllerRouteGroup(this);

        return routeGroup?.mountGroup(this.expressRouter) ?? this.expressRouter;
    }

    static get feature() {

        if (!this.featureRouter) {

            this._init();
        }

        return this.featureRouter;
    }

    static serve() {

       return this.router;
    }

    static _init() {
        
        if (this.expressRouter !== undefined || this.internalRouter !== undefined) {

            return;
        }

        this.expressRouter = express.Router();

        this.internalRouter = express.Router();

        this.featureRouter = {
            before: express.Router(),
            after: express.Router()
        };

        this.id = typeof this.id === 'symbol' ? this.id : Symbol(this.name);

        this.initRouteMap();

        this.registerRoutes();
    }

    static initRouteMap() {

        this.routeMap = new RouteMap();
    }

    /**
     * setups route that declared on each method except route group
     * 
     * @returns 
     */
    static registerRoutes() {

        const exprRouter = this.expressRouter;
        const internalRouter = this.internalRouter;
        const routeMap = this.routeMap;

        if (!exprRouter) {

            return;
        }

        const methods = getRegisteredMethods(this);
        
        for (const fn of methods || []) {
            
            const route = getRoute(fn);

            for (const entry of route.all.entries()) {
                
                const [pattern, verbChain] = entry;
                
                if (typeof pattern !== 'string' || typeof verbChain !== 'number') {

                    continue;
                }

                routeMap.map(pattern, route);                

                const verbList = convertToVerbList(verbChain);
                
                for (const verb of verbList || []) {
                    
                    exprRouter[verb](pattern, generateExpressHandler(this, pattern));
                    internalRouter[verb](pattern, generateInternalHandler(this, pattern));
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

            console.log(e)
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
        const routeMap = self(this).routeMap;

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

