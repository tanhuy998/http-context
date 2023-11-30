/**
 * @typedef {import('./httpContextConfiguration.js')} HttpContextConfiguration
 */

module.exports = class HttpContextConfigurator {

    /**@type {HttpContextConfiguration} */
    #config;

    /**
     * 
     * @param {HttpContextConfiguration} _config 
     */
    constructor(_HttpContextClass, _config) {

        this.#config = _config;

        this.#init();
    }

    #init() {


    }

    // /**
    //  * 
    //  * @param  {...(ErrorHandler | Function)} errorHandlers 
    //  */
    // onError(...errorHandlers) {

    //     this.pipeline.onError(...errorHandlers);   
    // }

    #done() {

        this.__lock();
    }

    serve() {

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

    #registerTopMiddlewares() {


    }

    #registerControllerResultFilter() {


    }

    #registerEndpointFilters() {

        const filters = this.#retrieveEndpointFilters();

        this.pipeline.addPhase().setHandler(endpointFilter(filters)).build();
    }

    #registerPreActionFilters() {


    }

    #registerPostActionFilters() {


    }

    #retrieveEndpointFilters() {

        const ret = [];

        for (const filterRouter of this.#controlersInternalRouter()) {

            ret.push(filterRouter);
        }

        return express.Router().use(ret);
    }

    #registerControllerInternalRouter(_handlers = []) {

        for (const filterRouter of this.#controlersInternalRouter()) {

            _handlers.push(filterRouter);
        }
    }

    *#controlersInternalRouter() {

        for (const ControllerClass of this.controllers.values()) {

            yield ControllerClass.filterRouter;
        }
    }

    lastStepInitialization() {

        this.#registerControllers();
    }

    #registerControllers() {

        const controllerPipeline = new Pipeline();

        for (const Controller of this.controllers.values() ?? []) {

            Controller._init();
            
            controllerPipeline.addPhase().setHandler(Controller).build();
        }
        
        this.pipeline.addPhase().use(controllerPipeline).build();
    }

    // /**
    //  * 
    //  * @param  {...(typeof HttpController | typeof ContextHandler | Function | typeof ErrorHandler)} Controller 
    //  */
    // use(...Controller) {

    //     for (const controller of Controller ?? []) {

    //         /**
    //          *  when the passed object is subclass of ErrorController
    //          */
    //         if (controller instanceof ErrorHandler) {

    //             this.pipeline.onError(controller);  

    //             continue;
    //         }
            
    //         if (!this.controllers.has(controller)) {

    //             this.controllers.add(controller);

    //             if (isHttpController(controller)) {
                    
    //                 this.contorllerIds.add(controller.id);
    //             }
    //         }
    //     }
    // }
}