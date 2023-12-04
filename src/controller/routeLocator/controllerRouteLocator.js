/**
 * @typedef {import('../httpController.js')} HttpController
 * @typedef {import('../../utils/route/routeMap.js')} RouteMap
 */


module.exports = class ControllerRouteLocator {

    /**@type {HttpController} */
    #controller;

    /**
     * 
     * @param {HttpController} _controller 
     */
    constructor(_controller) {

        this.#controller = _controller
    }

    requestMatch() {

        return this.#validateHttpContext();
    }

    #validateHttpContext() {

        const controller = this.#controller;
        const rawMeta = controller.httpContext.rawMeta;

        if (typeof rawMeta !== 'object') {

            return false;
        }
        // check for the existence of metadata of the current controller
        return typeof rawMeta[controller.classId] === 'object';
    }

    locate() {

        return this.#resolveRoutesMetadata();
    }

    /**
     * 
    */
    #resolveRoutesMetadata() {

        const controller = this.#controller;

        /**@type {RouteMap} */
        const routeMap = controller.configuration.routeMap;

        /**@type {string} */
        const currentRoutePattern = controller.httpContext.route.path;

        const routeMetadatas = routeMap.get(currentRoutePattern);

        return this.#mapRouteMetadataToMethods(routeMetadatas);
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
        const controller = this.#controller;
        const httpContext = controller.httpContext;
        
        /**@type {string} */
        const httpMethod = httpContext.method;//httpRequest.method;

        /**@type {string} */
        const reqPattern = httpContext.route.path;//httpRequest.route.path;

        
        
        for (/**@type {RouteMetadata} */ const routeMeta of _meta?.values() ?? []) {
            
            if (!routeMeta.match(reqPattern, httpMethod)) {

                continue;
            }

            const methodName = routeMeta.mappedMethodName;
            const fn = controller[methodName];
            
            if (typeof fn === 'function') {

                ret.push(fn);
            }
        }
        
        return ret;
    }
}