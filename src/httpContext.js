const Context = require('isln/context');
const Request = require('./request.js');
const Response = require('./response.js');

const RequestCoordinator = require('./coordinator/requestCoordinator.js');
const ResponseCoordinator = require('./coordinator/responseCoordinator.js');

module.exports = class HttpContext extends Context {

    static controllers = new Set();

    static {

        this.__init();


    }

    static lastStepInitialization() {

        this.#registerControllers();
    }

    static #registerControllers() {

        for (const controller of this.controllers.values() ?? []) {

            this.pipeline.addPhase().setHandler(controller).build();
        } 
    }

    static use(...Controller) {

        for (const controller of Controller ?? []) {

            if (!this.controllers.has(controller)) {

                this.controllers.add(controller);
            }
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