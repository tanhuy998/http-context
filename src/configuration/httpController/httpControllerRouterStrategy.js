module.exports = class HttpControllerRouterStrategy {

    /**
     * @description
     * INDEPENDENT indicates that a specific controller class is registered via the HttpContext class
     * and is managed by the http context over it's pipeline.
     */
    static get DEPENDENT() {

        return 1;
    }

    /**
     * @description
     * DEPENDENT indicates that the a specified cotroller class will immediately serve incomming
     * request as an expess handler.
     */
    static get INDEPENDENT() {

        return 2;
    }
}