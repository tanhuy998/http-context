const Context = require('isln/context');

const RequestCoordinator = require('./coordinator/requestCoordinator.js');
const ResponseCoordinator = require('./coordinator/responseCoordinator.js');
//const { Breakpoint, Pipeline } = require('isln/pipeline/index.js');
const { ErrorHandler, ContextHandler } = require('isln/handler/index.js');
const {mainContextHandler} = require('./expressHandler.js');
const endpointFilter = require('./handler/endpointFilter.js');
const express = require('express');
const Pipeline = require('isln/src/dependencies/pipeline/pipeline.js');
const metadata = require('isln/src/utils/metadata.js');
const { getPointControllerId } = require('./utils/requestMetadata.js');
const HttpController = require('./controller/httpController.js');
const self = require('reflectype/src/utils/self.js');
const isHttpController = require('./controller/isHttpController.js');

const {} = require('express');
const HttpContextConfigurationBuilder = require('./configuration/httpContext/httpContextConfigurationBuilder.js');
const HttpContextConfigurator = require('./configuration/httpContext/httpContextConfigurator.js');
const HttpContextConfiguration = require('./configuration/httpContext/httpContextConfiguration.js');

/**
 * @typedef {import('./controller/httpController.js')} HttpController
 * @typedef {import('./configuration/httpContext/httpContextConfiguration.js')} HttpContextConfiguration
 * @typedef {import('node:http').IncomingMessage} IncomingMessage
 * @typedef {import('node:http').OutgoingMessage} OutgoingMessage
 */


module.exports = class HttpContext extends Context {

    /**@type {HttpContextConfiguration | HttpContextConfigurator} */
    static configuration;

    /**@type {HttpContextConfigurationBuilder}*/
    static configurationSesison;

    static {

        this.__init();
        this.pipeline.summarizeErrors();
    }

    static configure() {

        //this.__init();

        this.configurationSesison = new HttpContextConfigurationBuilder(this);

        return this.configurationSesison;
    }

    static setConfiguration(configuration, configSession) {

        if (configSession !== this.configurationSesison) {

            throw new Error('invalid configuration');
        }

        Object.defineProperty(this, 'configuration', {
            writable: false,
            configurable: false,
            enumerable: false,
            value: configuration
        });

        this.configurationSesison = undefined;
    }

    static _beginServe() {

        const configuration = this.configuration;

        if (!(configuration instanceof HttpContextConfiguration)) {

            throw new Error('there is no configuration on http context to serve the application');
        }

        if(!configuration.mounted) {

            return new HttpContextConfigurator(this).serve();
        }
        
        return configuration.servingFactors;
    }


    /**
     * prototype definition
     */

    #request;
    #response;
    
    #requestParams;

    #group;

    #route;

    #rawMeta;

    #user;

    #isAuthenticated;

    #userRoll;

    // get rawMeta() {

    //     return this.#rawMeta;
    // }

    get rawMeta() {

        return this.#rawMeta;
    }

    /**@type {boolean} */
    get isAuthenticated() {

        return this.isAuthenticated;
    }

    get userRoll() {

        return this.#userRoll;
    }

    /**@type {IncomingMessage} */
    get request() {

        return this.#request;
    }

    /**@type {OutgoingMessage} */
    get response() {

        return this.#response;
    }

    /**@type {string} */
    get url() {

    }

    /**@type {string} */
    get uri() {

    }

    /**@type {string} */
    get domain() {


    }

    /**@type {Object} */
    get requestParams() {

        return this.#requestParams;
    }

    /**@type {string} */
    get group() {

        return this.#group
    }

    /**@type {Object} */
    get route() {

        return this.#route;   
    }

    get method() {

        return this.#request.method;
    }

    /**@type {} */
    get session() {


    }

    /**@type {} */
    get user() {


    }

    /**@type {} */
    get clientSession() {

        return this.#request.session;
    }

    /**
     * 
     * @param {IncomingMessage} req 
     * @param {OutgoingMessage} res 
     */
    constructor(req, res) {
        
        super();

        this.#request = req;
        this.#response = res;

        this.#init();
    }

    #init() {

        this.#rawMeta = metadata(this.request);

        this.#registerRequestAndResponse();
        this.#consumeRequest();

        this.#_cleanup();
    }

    #registerRequestAndResponse() {

        const contextSession = super.session;

        contextSession.save(RequestCoordinator.key, this.#request);
        contextSession.save(ResponseCoordinator.key, this.#response);
        contextSession.mapKey('request', RequestCoordinator.key);
        contextSession.mapKey('response', ResponseCoordinator.key);
    }

    #consumeRequest() {

        this.#initParams();
        this.#initRouteAndGroup();
    }

    #initParams() {
        
        this.#requestParams = this.#rawMeta.params;
    }

    #initRouteAndGroup() {

        const rawMeta = this.#rawMeta;

        if (typeof rawMeta !== 'object') {

            return;
        }

        this.#group = rawMeta.group;
        this.#route = rawMeta.route;
    }

    #_cleanup() {


    }
}