/**
 * @typedef {import('./httpControllerConfiguration.js')} HttpControllerConfiguration
 */

const { getRegisteredMethods, getRoute, getControllerRouteGroup } = require('../../utils/route/route.utils');
const {generateExpressHandler, generateInternalHandler} = require('../../expressHandler.js');
const HttpControllerRouterStrategy = require('./httpControllerRouterStrategy');
const {convertToVerbList} = require('../../utils/httpMethodEncoding.js');
const RouteGroup = require('../../utils/route/routeGroup.js');

module.exports = class HttpControllerConfigurator {

    //#httpContextClass;

    #controllerClass;

    /**@type {HttpControllerConfiguration} */
    #configuration;

    // #isMounted = false;

    // get isMounted() {

    //     return this.#isMounted;
    // }

    constructor(_ControllerClass) {

        this.#controllerClass = _ControllerClass;

        this.#init();
    }

    #init() {

        /**@type {HttpControllerConfiguration} */
        const configuration = this.#controllerClass?.configuration;

        if (!configuration) {

            const controllerClass = this.#controllerClass;

            throw new TypeError(`error caused whew configuring [${controllerClass.name}] with no configuration preset`);
        }

        this.#configuration = configuration;
    }

    mount() {

        if (this.#configuration.isMounted) {

            return;
        }

        this.#_mount();
    }

    #_mount() {

        this.#registerRoutes();
        this.#resolveRouteGroup();
    }

    #resolveRouteGroup() {

        const routeGroup = getControllerRouteGroup(this.#controllerClass) || new RouteGroup();

        this.#configuration.setRouteGroup(routeGroup, this.#controllerClass);
    }

    #retrieveControllerRouteHandlingMethods() {

        return getRegisteredMethods(this.#controllerClass);
    }

    /**
     * setups route that declared on each method except route group
     * 
     * @returns 
     */
    #registerRoutes() {

        const controllerClass = this.#controllerClass;
        const configuration = this.#configuration;

        const independentRouter = configuration.getRouter(HttpControllerRouterStrategy.INDEPENDENT);
        const dependentRouter = configuration.getRouter(HttpControllerRouterStrategy.DEPENDENT);
        const routeMap = configuration.routeMap;

        const methods = this.#retrieveControllerRouteHandlingMethods();

        for (const fn of methods || []) {

            const route = getRoute(fn);
            route.setContext(configuration.context);

            for (const entry of route.all.entries()) {

                const [pattern, verbChain] = entry;

                if (typeof pattern !== 'string' || typeof verbChain !== 'number') {

                    continue;
                }

                routeMap.map(pattern, route);

                const verbList = convertToVerbList(verbChain);

                for (const verb of verbList || []) {

                    dependentRouter[verb](pattern, generateExpressHandler(controllerClass, pattern));
                    independentRouter[verb](pattern, generateInternalHandler(controllerClass, pattern));
                }
            }
        }
    }
}