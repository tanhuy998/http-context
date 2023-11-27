
/**
 * @typedef {import('../../controller/httpController.js')} HttpController
 * @typedef {import('../../routeGroup/routeGroup.js')} RouteGroup
 */

const metadata = require('isln/src/utils/metadata');
const { ROUTE_GROUP } = require('./constant.js');

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

module.exports = {concatenateRoutePattern, initRouteGroup, getControllerRouteGroup};