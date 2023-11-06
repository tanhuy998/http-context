const {METADATA} = require('reflectype/src/constants.js');
const RouteMetadata = require('./routeMetadata');

function registerRoute(_func, _verb, _pattern) {

    if (typeof _verb !== 'string' || typeof _pattern !== 'string') {

        throw new TypeError('_verb and _pattern must be type of string');
    }

    const meta = _func[METADATA] ??= {};

    /**@type {RouteMetadata} */
    const route = meta.route instanceof RouteMetadata ? meta.route : new RouteMetadata();

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

module.exports = {hasRoute, registerRoute, getRegisteredMethods, getRoute}