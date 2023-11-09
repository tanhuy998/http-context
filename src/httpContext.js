const Context = require('isln/context');

const RequestCoordinator = require('./coordinator/requestCoordinator.js');
const ResponseCoordinator = require('./coordinator/responseCoordinator.js');
const { Breakpoint } = require('isln/pipeline/index.js');
const { ErrorHandler, ContextHandler } = require('isln/handler/index.js');
const {mainContextHandler} = require('./expressHandler.js');

/**
 * @typedef {import('./controller/httpController.js')} HttpController
 */
module.exports = class HttpContext extends Context {

    static #lock = false;

    static get isLocked() {

        return this.#lock;
    }

    static controllers = new Set();

    static {

        this.__init();
    }

    static lastStepInitialization() {

        this.#registerControllers();
    }

    static #registerControllers() {

        for (const Controller of this.controllers.values() ?? []) {

            Controller._init();
            
            this.pipeline.addPhase().setHandler(Controller).build();
        } 
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

    static begin() {

        this.#registerControllers();

        if (typeof super._lock === 'function') {

            super._lock();
        }        

        this.#lock = true;
    }

    static serve() {

        this.begin();

        const handlers = [];

        this.#registerControllerInternalRouter(handlers);

        handlers.push(mainContextHandler(this));

        return handlers;
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