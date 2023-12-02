const ContextLockable = require('isln/src/dependencies/lockable/contextLockable');
const RouteMap = require('../../utils/route/routeMap');
const HttpControllerRouterStrategy = require('./httpControllerRouterStrategy');
const express = require('express');
const RouteGroup = require('../../utils/route/routeGroup');

/**
 * @typedef {Object} LockStateObject
 * @property {boolean} isLocked
 */

module.exports = class HttpControllerConfiguration extends ContextLockable {

    /**
     * @override
     * override ContextLockable locked actions
     */
    lockActions = ['getRouter'];

    #dependentRouter = express.Router();

    #independentRouter = express.Router();

    #routeMap = new RouteMap();

    #routeRegex;
    
    /**@type {RouteGroup?} */
    #routeGroup;

    get isMounted() {

        return this.context.isLocked;
    }

    get routeMap() {

        return this.#routeMap;
    }

    get routeRegex() {

        return this.#routeRegex;
    }

    /**
     * 
     * @param {LockStateObject} _HttpControllerCLass
     */
    constructor(_HttpControllerCLass) {

        super(_HttpControllerCLass);

        
    }

    getRouter(_strategy) {

        switch(_strategy) {
            case HttpControllerRouterStrategy.DEPENDENT:
                return this.#dependentRouter;
            case HttpControllerRouterStrategy.INDEPENDENT:
                return this.#independentRouter;
            default:
                throw new TypeError('invalid router strategy');
        }
    }

    /**
     * 
     * @param {any} _context 
     * @returns {Array<express.Router> | express.Router}
     */
    getIndependentRouter(_context) {

        this.#authorizeContext(_context);

        return this.#independentRouter;
    }

    /**
     * 
     * @param {any} _context 
     * @returns {Array<express.Router> | express.Router}
     */
    getDependentRouter(_context) {

        this.#authorizeContext(_context);

        return this.#dependentRouter;
    }
    
    getRouteGroup(_context) {

        this.#authorizeContext(_context);

        return this.#routeGroup;
    }

    getDependentGroup() {

        return this.#routeGroup.mountGroup(this.#dependentRouter);
    }

    retrieveIndepentdentGroup() {

        return this.#routeGroup.mountGroup(this.#independentRouter);
    }

    /**
     * 
     * @param {RouteGroup} _group 
     * @param {LockStateObject} _context 
     */
    setRouteGroup(_group, _context) {

        this.#authorizeContext(_context);

        if (!(_group instanceof RouteGroup)) {

            throw new TypeError('invalid type of _group');
        }

        this.#routeGroup = _group;
    }

    #authorizeContext(_context) {
        
        if (_context !== this.context) {

            throw new Error('');
        }

        return true;
    }
}