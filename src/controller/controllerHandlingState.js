module.exports = class ControllerHandlingState {

    #isAsync;

    #isEndpoint;

    #httpContext;

    get isAsync() {

        return this.#isAsync
    }

    get isEndpoint() {

        return this.#isEndpoint;
    }
    constructor(httpContext) {

        this.#httpContext = httpContext;
    }

    #init() {

        
    }
}