const HandlerKind = require('isln/src/dependencies/pipeline/handlerKind.js');
const { ErrorHandler } = require('isln/handler');
const HttpContextConfiguration = require('./httpContextConfiguration');
const HttpController = require('../../controller/httpController');
const HttpContextConfigurator = require('./httpContextConfigurator.js');

/**
 * @typedef {import('./httpContextConfigurator.js')} HttpContextConfigurator
 */

module.exports = class HttpContextConfigurationBuilder {

    /**@type {Set<typeof HttpController>} */
    #controllers = new Set();

    #contorllerIds = new Set();

    #errorHandlers = [];

    #httpContextClass;

    constructor(_HttpContext) {

        this.#httpContextClass = _HttpContext;
    }

    /**
     * 
     * @param  {...(typeof HttpController | typeof ContextHandler | Function | typeof ErrorHandler)} _Handlers
     */
    use(..._Handlers) {

        for (const Handler of _Handlers) {

            if (!Handler) {

                throw new TypeError('invalid type passed to for request handling action');
            }

            /**
             *  when the passed object is subclass of ErrorController
             */
            if (Handler.prototype instanceof ErrorHandler) {

                // this.pipeline.onError(Handler);  
                this.#errorHandlers.push(Handler);

                continue;
            }
            
            this.useController(Handler);
        }

        return this;
    }

    /**
     * 
     * @param  {...HttpController} _Controllers 
     */
    useController(..._Controllers) {

        for (const ControllerClass of _Controllers) {

            if (!(ControllerClass.prototype instanceof HttpController)) {
                    
                throw new TypeError('invalid type of controller, controller must extends [HttpController] class');
            }

            if (!this.#controllers.has(ControllerClass)) {

                this.#controllers.add(ControllerClass);

                this.#contorllerIds.add(ControllerClass.id);
            }
        }

        return this;
    }

    useAuthorization() {
        
        return this;
    }

    /**
     * 
     * @param {typeof HttpController | HttpController} _unknown 
     */
    hasController(_unknown) {

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
        
        return this.#contorllerIds.has(controllerId);
    }

    /**
     * 
     * @param  {...(ErrorHandler | Function)} errorHandlers 
     */
    onError(...errorHandlers) {

        //this.pipeline.onError(...errorHandlers);

        for (const _unknown of errorHandlers) {

            this.#registerErrorHandler(_unknown);
        }

        return this;
    }

    #registerErrorHandler(_unknown) {

        const kind = HandlerKind.classify(_unknown);

        switch (kind) {
            case HandlerKind.REGULAR: {                

                if (_unknown.prototype instanceof ErrorHandler) {

                   break;
                }
                throw new TypeError(`cannot register controller class [${_unknown.name}] as error handler`);               
            }
            case HandlerKind.FUNCTION:
                break;
            default:
                throw new TypeError('invalid type of error handler');
        }

        this.#errorHandlers.push(_unknown);
    }

    build() {

        const HttpContext = this.#httpContextClass;

        const configuration = this.#_build();

        HttpContext.setConfiguration(configuration, this);

        return new HttpContextConfigurator(HttpContext);
    }

    /**
     * @returns {HttpContextConfiguration}
     */
    #_build() {

        const configuration = new HttpContextConfiguration({
            controllers: this.#controllers,
            controlerIds: this.#contorllerIds,
            errorHandlers: this.#errorHandlers,
        });

        return configuration;
    }
}