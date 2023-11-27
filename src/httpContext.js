const Context = require('isln/context');

const RequestCoordinator = require('./coordinator/requestCoordinator.js');
const ResponseCoordinator = require('./coordinator/responseCoordinator.js');
//const { Breakpoint, Pipeline } = require('isln/pipeline/index.js');
const { ErrorHandler, ContextHandler } = require('isln/handler/index.js');
const {mainContextHandler} = require('./expressHandler.js');
const endpointFilter = require('./handler/endpointFilter.js');
const express = require('express');
const Pipeline = require('isln/src/dependencies/pipeline/pipeline.js');

/**
 * @typedef {import('./controller/httpController.js')} HttpController
 */
module.exports = class HttpContext extends Context {

    /**@type {Set<typeof HttpController>} */
    static controllers = new Set();

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
     * @param  {...(HttpController | ContextHandler | Function | ErrorHandler)} Controller 
     */
    static use(...Controller) {

        for (const controller of Controller ?? []) {

            if (controller instanceof ErrorHandler) {

                this.pipeline.onError(controller);

                continue;
            }

            if (!this.controllers.has(controller)) {

                this.controllers.add(controller);
            }
        }
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

        this.#registerEndpointFilters();

        this.#registerPreActionFilters();

        this.#registerControllers();

        this.#registerPostActionFilters();

        this.#done();

        return mainContextHandler(this);
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

    static #registerControllerInternalRouter(_handlers = []) {

        for (const filterRouter of this.#controlersInternalRouter()) {

            _handlers.push(filterRouter);
        }
    }

    static* #controlersInternalRouter() {

        for (const ControllerClass of this.controllers.values()) {

            yield ControllerClass.filterRouter;
        }
    }


    #request;
    #response;
    
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

    constructor(req, res) {

        super();

        this.#request = req;
        this.#response = res;

        this.#init();
    }

    #init() {

        this.#registerRequestAndResponse();
    }

    #registerRequestAndResponse() {

        //
        const contextSession = this.session;

        contextSession.save(RequestCoordinator.key, this.#request);
        contextSession.save(ResponseCoordinator.key, this.#response);
        contextSession.mapKey('request', RequestCoordinator.key);
        contextSession.mapKey('response', ResponseCoordinator.key);
    }
}