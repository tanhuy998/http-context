const HttpContext = require('isln/context');
const { initControllerMetadata, initRequestMetadata, pointController, getPointControllerId } = require('./utils/requestMetadata.js');
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
        
        
        /**
         *  routes could have the same name when they are in different group,
         */
        if (currentRoute?.path !== _controllerPath) {

            return next();
        }
        
        try {
            
            /**
             * applying controller decision filter
             */
            applyFilter({request: req, response: res}, _filters);

            const controllerMeta = initControllerMetadata(req, _controllerClass);

            pointController(req, _controllerClass);

            const wrapperMeta = metadata(req);
            
            wrapperMeta.params = merge(wrapperMeta?.params ?? {}, req.params ?? {});

            controllerMeta.route = currentRoute;
            controllerMeta.group = wrapperMeta.group;

            return next();
        }
        catch(error) {
            
            return next(error);
        }
    }
}

function generatRouteGroupHandler(_ControllerClass, _groupPath, _filters = []) {

    return function groupHandler(req, res, next) {
        
        try {
            
            applyFilter({ request: req, response: res }, _filters);
            
            const wrapper = initRequestMetadata(req);
            
            wrapper.group = _groupPath;
            wrapper.params = merge(wrapper.params ?? {}, req.params ?? {});
            
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
            
            if (!isValidRequest(req, Context)) {
                
                return next(undefined);
            }

            const httpContext = new Context(req, res);
            
            const pipeline = Context.pipeline;
    
            await pipeline.run(httpContext);
    
            return next();
        }
        catch (err) {

            if (err instanceof Breakpoint) {

                err = err.originError;
            }

            return next(err);
        }
    }
}

/**
 * 
 * @param {import('express').Request} request 
 * @param {Typeof HttpContext} _HttpContextCLass 
 */
function isValidRequest(request, _HttpContextCLass) {

    const requestControllerId = getPointControllerId(request);
    
    if (typeof requestControllerId !== 'symbol') {

        return false;
    }
    
    return _HttpContextCLass?.configuration?.hasController(requestControllerId);
}

module.exports = {generateExpressHandler, generateInternalHandler, mainContextHandler, generatRouteGroupHandler}