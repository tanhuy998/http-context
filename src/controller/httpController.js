const BaseController = require("./baseController");
const express = require('express');
const {hasRoute, getRegisteredMethods, getRoute} = require('../utils/httpRoute.js');
const RouteMetadata = require("../utils/routeMetadata.js");
const Context = require("isln/context/index.js");
const HttpContext = require("../httpContext.js");
const self = require('reflectype/src/utils/self.js');
const {convertToVerbList} = require('../utils/httpMethodEncoding.js');


module.exports = class HttpController extends BaseController {

    static expressRouter = undefined;

    /**@type {Set<string>} */
    static routeMap;

    static get router() {

        if (!this.expressRouter) {

            this._init();
        }

        return this.expressRouter;
    }

    static serve() {

       return this.router;
    }

    static _init() {

        this.expressRouter = express.Router();

        this.initRouteMap();

        this.registerRoutes();
    }

    static initRouteMap() {

        this.routeMap = new Set();
    }

    static registerRoutes() {

        const exprRouter = this.router;

        if (!exprRouter) {

            return;
        }

        const methods = getRegisteredMethods(this);

        for (const fn of methods) {

            const route = getRoute(fn);

            for (const entry of route.all.entries()) {
                //console.log(entry)
                const [pattern, verbChain] = entry;
                
                if (typeof pattern !== 'string' || typeof verbChain !== 'number') {

                    continue;
                }

                const verbList = convertToVerbList(verbChain);
                
                for (const verb of verbList || []) {

                    console.log(verb, pattern);
                    exprRouter[verb](pattern, generateExpressHandler(this, fn));
                }
            }
        }
    }


    get httpContext() {

        return super.context;
    }

    handle() {

        const req = this.httpContext.request;
        const res = this.httpContext.response;

        const router = self(this).router;

        router(req, res, () => {});
    }
}

/**
 * 
 * @param {HttpContext} _controllerClass 
 * @param {Function} _func 
 * @returns 
 */
function generateExpressHandler(_controllerClass, _func) {

    // if (!(_controllerClass?.prototype instanceof HttpController)) {

    //     throw new TypeError('_controllerClass must be type of HttpController');
    // }

    return async function (req, res, next) {

        try {

            const httpContext = new HttpContext(req, res);

            const DI = HttpContext.DI;

            const controllerObj = new _controllerClass(httpContext);

            DI.inject(controllerObj);

            const args = await DI.resolveArguments(_func, httpContext);


            await _func.call(controllerObj, ...(args ?? []));

            //await DI.invoke(controllerObj, _func, httpContext);

            next();
        }
        catch (error) {

            next(error);
        }
    }
}

function generateInternalHandler() {


}