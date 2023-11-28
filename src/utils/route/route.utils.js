
/**
 * @typedef {import('../../controller/httpController.js')} HttpController
 * @typedef {import('./routeGroup.js')} RouteGroup
 */

const metadata = require('isln/src/utils/metadata');
const { ROUTE_GROUP } = require('./constant.js');
const {METADATA} = require('reflectype/src/constants.js');
const RouteMetadata = require('./routeMetadata');

/**
 * 
 * @param  {...string} paths 
 */
function concatenateRoutePattern(...paths) {

    return paths.join('/').replace(/\/\/+/g, '/');
}

/**
 * 
 * @param {typeof HttpController} _ControllerClass 
 * @returns {RouteGroup?}
 */
function getControllerRouteGroup(_ControllerClass) {

    const meta =  metadata(_ControllerClass);

    if (typeof meta === 'object') {

        return meta[ROUTE_GROUP];
    }   
}

/**
 * 
 * @param {typeof HttpController} _ControllerClass 
 * @param {RouteGroup} _group 
 */
function initRouteGroup(_ControllerClass, _group) {

    metadata.initMetadataField(_ControllerClass);

    const meta = metadata(_ControllerClass);

    /**@type {RouteGroup} */
    const routeGroup = meta[ROUTE_GROUP] ??= _group;

    routeGroup.addPrefix(..._group.prefixes);
}

/**
 * 
 * @param {Function} _func 
 * @param {*} _verb 
 * @param {*} _pattern 
 * @param {string | Symbol} _methodName
 * @returns 
 */
function registerRoute(_func, _verb, _pattern, _methodName) {

    if (typeof _verb !== 'string' || typeof _pattern !== 'string') {

        throw new TypeError('_verb and _pattern must be type of string');
    }

    const meta = _func[METADATA] ??= {};

    /**@type {RouteMetadata} */
    const route = meta.route instanceof RouteMetadata ? meta.route : new RouteMetadata(_func, _methodName);

    route.set(_verb, _pattern);

    meta.route = route;

    return true;
}

/**
 * 
 * @param {Function} _func
 * @returns {RouteMetadata?} 
 */
function getRoute(_func) {

    if (typeof _func !== 'function') {

        return undefined;
    }

    const meta = _func[METADATA];

    if (meta?.route instanceof RouteMetadata) {

        return meta.route;
    }

    return undefined;
}
/**
 * 
 * @param {Function} _controllerClass 
 * @returns {Array<Function>}
 */
function getRegisteredMethods(_controllerClass) {

    const classPrototype = _controllerClass.prototype;

    return Object.getOwnPropertyNames(classPrototype)
                            .filter(name => {

                                if (name === 'constructor') {

                                    return false;
                                }

                                const prop = classPrototype[name];

                                return hasRoute(prop);
                            })
                            .map(name => {

                                return classPrototype[name];
                            });
}

/**
 * 
 * @param {Function} _func 
 * @returns {boolean}
 */
function hasRoute(_func) {

    if (typeof _func !== 'function') {

        return undefined;
    }

    const meta = _func[METADATA];

    if (typeof meta !== 'object') {

        return false;
    }

    if (!(meta.route instanceof RouteMetadata)) {

        return false;
    }
    else {

        return true;
    }
}

module.exports = {concatenateRoutePattern, initRouteGroup, getControllerRouteGroup, hasRoute, getRegisteredMethods, getRoute, registerRoute};