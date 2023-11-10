const HttpContext = require('isln/context');
// const {METADATA} = require('reflectype/src/constants.js');
const {initRequestMetadata, initControllerMetadata} = require('./utils/requestMetadata.js');
const { applyFilter } = require('./utils/controllerFilter.js');

/**
 * @typedef {import('./controller/httpController.js')} HttpController
 */

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

/**
 * 
 * @param {typeof HttpController} _controllerClass 
 * @param {string | Symbol} _method 
 * @param {Array<Function>} _filters
 * @returns 
 */
function generateInternalHandler(_controllerClass, _method, _filters = []) {

    return function filter(req, res, next) {

        try {
            /**
             * applying controller filter
             */
            applyFilter({request: req, response: res}, _filters);

            //const meta = initMetadata(req);
            const meta = initControllerMetadata(req);

            const currentRoute = req.route;

            meta.route = currentRoute;
            meta.params ??= {};
            Object.assign(, req.params)
            

            next();
        }
        catch(error) {

            next();
        }
    }

    // function initMetadata(req) {

    //     const wrapper = req[METADATA] ??= {};

    //     const id = _controllerClass.id;

    //     return actualMeta = wrapper[id] ??= {};
    // }
}

/**
 * 
 * @param {typeof HttpContext} Context 
 * @returns 
 */
function mainContextHandler(Context) {

    return async function (req, res, next) {

        try {
    
            const httpContext = new Context(req, res);
    
            const pipeline = Context.pipeline;
    
            await pipeline.run(httpContext);
    
            next();
        }
        catch (err) {

            if (err instanceof Breakpoint) {

                err = err.originError;
            }

            next(err);
        }
    }
}

module.exports = {generateExpressHandler, generateInternalHandler, mainContextHandler}