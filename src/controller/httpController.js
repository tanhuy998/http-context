const RouteMetadata = require("../utils/route/routeMetadata.js");
const self = require('reflectype/src/utils/self.js');
const RouteMap = require("../utils/route/routeMap.js");
const { hasControllerMetadata } = require("../utils/requestMetadata.js");
const { BASE_HTTP_CONTROLLER, CONFIGURATION, SUB_CLASS_ID } = require("./constant.js");
const HttpControllerConfiguration = require("../configuration/httpController/httpControllerConfiguration.js");
const HttpControllerConfigurator = require("../configuration/httpController/httpControllerConfigurator.js");
const SignalIssuer = require("../signal/pipeline/signalIssuer.js");
const IActionResult = require("../actionResult/iActionResult.js");
const {Any} = require('reflectype/src/type');

/**
 * @typedef {import('../httpContext.js')} HttpContext
 */

const proto = module.exports = class HttpController extends SignalIssuer {

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

    get classId() {

        return self(this).id;
    }

    constructor(_context) {

        super(_context, [IActionResult, Any])
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

            const handlingResult = this.#handlingProgress;

            return this._emit(handlingResult);
        }
        catch(e) {

            
        }
    }

    #requestMatch() {

        const req = this.httpContext.request;
        
        //return hasControllerMetadata(req, this);
        return this.#validateHttpContext();
    }

    #validateHttpContext() {

        const rawMeta = this.httpContext.rawMeta;

        if (typeof rawMeta !== 'object') {

            return false;
        }

        return typeof rawMeta[this.classId] === 'object';
    }

    #resolve() {

        const methods = this.#resolveRoutesMetadata();
        
        return this.#treat(methods.values());
    }

    /**
     * 
    */
    #resolveRoutesMetadata() {

        /**@type {RouteMap} */
        const routeMap = this.configuration.routeMap;

        /**@type {string} */
        const currentRoutePattern = this.httpContext.route.path;

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

        //const httpRequest = this.httpContext.request;
        const httpContext = this.httpContext;
        
        /**@type {string} */
        const httpMethod = httpContext.method;//httpRequest.method;

        /**@type {string} */
        const reqPattern = httpContext.route.path;//httpRequest.route.path;

        
        
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
