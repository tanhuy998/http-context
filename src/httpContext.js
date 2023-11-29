const Context = require('isln/context');

const RequestCoordinator = require('./coordinator/requestCoordinator.js');
const ResponseCoordinator = require('./coordinator/responseCoordinator.js');
//const { Breakpoint, Pipeline } = require('isln/pipeline/index.js');
const { ErrorHandler, ContextHandler } = require('isln/handler/index.js');
const {mainContextHandler} = require('./expressHandler.js');
const endpointFilter = require('./handler/endpointFilter.js');
const express = require('express');
const Pipeline = require('isln/src/dependencies/pipeline/pipeline.js');
const metadata = require('isln/src/utils/metadata.js');
const { getPointControllerId } = require('./utils/requestMetadata.js');
const HttpController = require('./controller/httpController.js');
const self = require('reflectype/src/utils/self.js');
const isHttpController = require('./controller/isHttpController.js');

/**
 * @typedef {import('./controller/httpController.js')} HttpController
 */
module.exports = class HttpContext extends Context {

    /**@type {Set<typeof HttpController>} */
    static controllers = new Set();

    static contorllerIds = new Set();

    static {

        this.__init();
    }

    static lastStepInitialization() {

        this.#registerControllers();
    }

    static #registerControllers() {

        const controllerPipeline = new Pipeline();

        for (const Controller of this.controllers.values() ?? []) {

            Controller._init();
            
            controllerPipeline.addPhase().setHandler(Controller).build();
        }
        
        this.pipeline.addPhase().use(controllerPipeline).build();
    }

    /**
     * 
     * @param  {...(typeof HttpController | typeof ContextHandler | Function | typeof ErrorHandler)} Controller 
     */
    static use(...Controller) {

        for (const controller of Controller ?? []) {

            /**
             *  when the passed object is subclass of ErrorController
             */
            if (controller instanceof ErrorHandler) {

                this.pipeline.onError(controller);  

                continue;
            }
            
            if (!this.controllers.has(controller)) {

                this.controllers.add(controller);

                if (isHttpController(controller)) {
                    
                    this.contorllerIds.add(controller.id);
                }
            }
        }
    }

    /**
     * 
     * @param {typeof HttpController | HttpController} _unknown 
     */
    static hasController(_unknown) {

        let controllerId;

        if (typeof _unknown === 'symbol') {

            controllerId = _unknown;
        }
        else if (_unknown instanceof HttpController) {

            controllerId = self(_unknown).id;
        }
        else if (_unknown.prototype instanceof HttpController) {

            controllerId = _unknown.id;
        }
        else {

            throw new TypeError('_unknown has to be a Controller instance or a Controller class');
        }
        
        return this.contorllerIds.has(controllerId);
    }

    /**
     * 
     * @param  {...(ErrorHandler | Function)} errorHandlers 
     */
    static onError(...errorHandlers) {

        this.pipeline.onError(...errorHandlers);   
    }

    static #done() {

        this.__lock();
    }

    static serve() {

        //this.begin();

        this.#registerTopMiddlewares();

        //this.#registerEndpointFilters();

        this.#registerPreActionFilters();

        this.#registerControllers();

        this.#registerPostActionFilters();

        this.#done();

        const endpointFilter = this.#retrieveEndpointFilters();

        return [endpointFilter, mainContextHandler(this)];
    }

    static #registerTopMiddlewares() {


    }

    static #registerControllerResultFilter() {


    }

    static #registerEndpointFilters() {

        const filters = this.#retrieveEndpointFilters();

        this.pipeline.addPhase().setHandler(endpointFilter(filters)).build();
    }

    static #registerPreActionFilters() {


    }

    static #registerPostActionFilters() {


    }

    static #retrieveEndpointFilters() {

        const ret = [];

        for (const filterRouter of this.#controlersInternalRouter()) {

            ret.push(filterRouter);
        }

        return express.Router().use(ret);
    }

    // static #registerControllerInternalRouter(_handlers = []) {

    //     for (const filterRouter of this.#controlersInternalRouter()) {

    //         _handlers.push(filterRouter);
    //     }
    // }

    static* #controlersInternalRouter() {

        for (const ControllerClass of this.controllers.values()) {

            yield ControllerClass.filterRouter;
        }
    }


    /**
     * prototype definition
     */

    #request;
    #response;
    
    #requestParams;

    #group;

    #route;

    get request() {

        return this.#request;
    }

    get response() {

        return this.#response;
    }

    get url() {

    }

    get uri() {

    }

    get domain() {


    }

    get requestPatams() {

        return this.#requestParams;
    }

    get group() {

        return this.#group
    }

    get route() {

        return this.#route;   
    }

    constructor(req, res) {

        super();

        this.#request = req;
        this.#response = res;

        this.#init();
    }

    #init() {

        this.#registerRequestAndResponse();
        this.#consumeRequest();

        this.#_cleanup();
    }

    #registerRequestAndResponse() {

        //
        const contextSession = this.session;

        contextSession.save(RequestCoordinator.key, this.#request);
        contextSession.save(ResponseCoordinator.key, this.#response);
        contextSession.mapKey('request', RequestCoordinator.key);
        contextSession.mapKey('response', ResponseCoordinator.key);
    }

    #consumeRequest() {

        this.#initParams();
        this.#initRouteAndGroup();
    }

    #initParams() {

        const req = this.#request;

        const requestMeta = metadata(req);

        this.#requestParams = requestMeta?.params;
    }

    #initRouteAndGroup() {

        const req = this.#request;

        const requestMeta = metadata(req);

        if (typeof requestMeta !== 'object') {

            return;
        }

        const controllerId = getPointControllerId(req);
        
        const controllerMeta = requestMeta[controllerId];

        this.#group = controllerMeta?.group;

        this.#route = controllerMeta?.route;
    }

    #_cleanup() {


    }
}