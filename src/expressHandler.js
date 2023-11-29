const HttpContext = require('isln/context');
const { initControllerMetadata, initRequestMetadata } = require('./utils/requestMetadata.js');
const { applyFilter } = require('./utils/controllerFilter.js');
const {Breakpoint} = require('isln/pipeline');
const metadata = require('isln/src/utils/metadata.js');

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

            return next();
        }
        catch (error) {

            return next(error);
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
function generateInternalHandler(_controllerClass, _controllerPath, _filters = []) {
    
    return function controllerFilter(req, res, next) {

        const currentRoute = req.route;
        
        if (currentRoute?.path !== _controllerPath) {

            return next();
        }
        
        try {
            
            /**
             * applying controller decision filter
             */
            applyFilter({request: req, response: res}, _filters);

            const wrapperMeta = metadata(req);

            const meta = initControllerMetadata(req, _controllerClass);
            
            meta.route = currentRoute;
            meta.params = merge(meta?.params ?? {} , wrapperMeta?.params ?? {}, req.params ?? {});

            return next();
        }
        catch(error) {
            
            
            return next(error);
        }
    }
}

function generatRouteGroupHandler(_ControllerClass, _filters = []) {

    const controllerRouteMap = _ControllerClass.routeMap;

    return function groupHandler(req, res, next) {

        const path = req.path;
        
        if (!controllerRouteMap?.match(path)) {

            return next();
        }
    
        try {
            
            applyFilter({ request: req, response: res }, _filters);
            
            const wrapper = initRequestMetadata(req);
            
            wrapper.params = merge(wrapper ?? {}, req.params ?? {});
            
            return next();
        }
        catch (e) {

            return next(e);
        }
    }
}



function merge(target, ...sources) {

    return Object.assign(target, ...sources);
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

module.exports = {generateExpressHandler, generateInternalHandler, mainContextHandler, generatRouteGroupHandler}