const self = require('reflectype/src/utils/self.js');
const { BASE_HTTP_CONTROLLER, CONFIGURATION, SUB_CLASS_ID } = require("./constant.js");
const HttpControllerConfiguration = require("../configuration/httpController/httpControllerConfiguration.js");
const HttpControllerConfigurator = require("../configuration/httpController/httpControllerConfigurator.js");
const SignalIssuer = require("../signal/pipeline/signalIssuer.js");
const IActionResult = require("../actionResult/iActionResult.js");
const {Any} = require('reflectype/src/type');
const ResponseResultBuilder = require("../responseResult/responseResultBuilder.js");
const matchType = require('reflectype/src/libs/matchType.js');
const ActionResult = require("../actionResult/actionResult.js");
const ControllerRouteLocator = require("./routeLocator/controllerRouteLocator.js");

/**
 * @typedef {import('../httpContext.js')} HttpContext
 */

module.exports = class HttpController extends SignalIssuer {

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
            
            const routeLocator = new ControllerRouteLocator(this);

            if (!routeLocator.requestMatch()) {

                return;
            }
            
            // locates the method that handle for a route
            const methods = routeLocator.locate();
            // invoke and trace it's result
            this.#treat(methods.values());
        }
        catch(e) {
            
            if (e instanceof Error) {

                throw e;
            }
        }

        /**@type {any | Promise} */
        const handlingResult = this.#handlingProgress;
        // just emit the result to signal consumer
        return this._emit(handlingResult);
    }

    /**
     * @override
     */
    _emit(_data) {

        _data = matchType(IActionResult, _data) ? _data : new ActionResult(_data);

        super._emit(_data);
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

    status(_code) {

        return new ResponseResultBuilder().status(_code);
    }
}
