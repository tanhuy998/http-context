/**
 * @typedef {import('./httpControllerConfiguration.js')} HttpControllerConfiguration
 */

const { getRegisteredMethods, getRoute, getControllerRouteGroup } = require('../../utils/route/route.utils');
const {generateExpressHandler, generateInternalHandler} = require('../../expressHandler.js');
const HttpControllerRouterStrategy = require('./httpControllerRouterStrategy');
const {convertToVerbList} = require('../../utils/httpMethodEncoding.js');

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

        //this.#httpContextClass = configuration.context;
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

        const routeGroup = getControllerRouteGroup(this.#controllerClass);

        this.#configuration.setRoutGroup(routeGroup, this.#controllerClass);
    }


    // serve() {

    //     return this.router;
    // }

    #retrieveControllerRouteHandlingMethods() {

        return getRegisteredMethods(this.#controllerClass);
    }

    /**
     * setups route that declared on each method except route group
     * 
     * @returns 
     */
    #registerRoutes() {

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

                    dependentRouter[verb](pattern, generateExpressHandler(this, pattern));
                    independentRouter[verb](pattern, generateInternalHandler(this, pattern));
                }
            }
        }
    }
}