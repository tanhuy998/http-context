const BaseController = require("./baseController");
const express = require('express');
const {hasRoute, getRegisteredMethods, getRoute} = require('../utils/httpRoute.js');
const RouteMetadata = require("../utils/routeMetadata.js");
const Context = require("isln/context/index.js");
const HttpContext = require("../httpContext.js");
const self = require('reflectype/src/utils/self.js');


module.exports = class HttpController extends BaseController {

    static expressRouter = undefined;

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

        this.registerRoutes();
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
                console.log(entry)
                const [pattern, verbs] = entry;

                if (typeof pattern !== 'string' || !(verbs instanceof Set)) {

                    continue;
                }

                for (const verb of verbs) {

                    const handleFunction = generateExpressHandler(this, fn);
                    console.log(verb, pattern)
                    exprRouter[verb](pattern, handleFunction);
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

    return async function(req, res, next) {

        const httpContext = new HttpContext(req, res);

        const DI = HttpContext.DI;

        const controllerObj = new _controllerClass(httpContext);

        DI.inject(controllerObj);

        const args = await DI.resolveArguments(_func, httpContext);

        try {
            
            await _func.call(controllerObj, ...(args ?? []));

            next();
        }
        catch(error) {

            next(error);
        }
    }
}