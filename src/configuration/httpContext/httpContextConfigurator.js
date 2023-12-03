'use strict'

const {Pipeline} = require('isln/pipeline');
const HttpContextConfiguration = require('./httpContextConfiguration.js');
const express = require('express');
const {mainContextHandler} = require('../../expressHandler.js');
const ActionResultFilter = require('../../actionResult/filter/actionResultFilter.js');

/**
 * @typedef {import('../httpController/httpControllerConfiguration.js')} HttpControllerConfiguration
 * @typedef {import('../../httpContext.js')} HttpContext
 */


/**
 * @description
 * HttpContextConfigurator mounts configuration of http context class and return list of express handler
 * for the express app
 * 
 */
module.exports = class HttpContextConfigurator {

    /**@type {typeof HttpContext} */
    #httpContextClass

    /**@type {HttpContextConfiguration} */
    #configuration;

    #ready = false;
    /**
     * 
     * @param {typeof HttpContext} _HttpContextClass 
     */
    constructor(_HttpContextClass) {

        this.#httpContextClass = _HttpContextClass;

        this.#init();
    }

    #init() {

        const configuration = this.#httpContextClass.configuration;

        if (!(configuration instanceof HttpContextConfiguration)) {

            throw new TypeError('cannot configure for a class that does not have configaration');
        }

        this.#configuration = configuration;
    }

    #mount() {

        this.#registerTopMiddlewares();
        this.#registerPreActionPhase();
        this.#registerControllerPhase();
        this.#registerControllerActionResutFilter();
        this.#registerErrorHandlers();
        this.#registerPostActionPhase();
    }

    serve() {

        if (this.#ready) {

            return this.#configuration.servingFactors;
        }

        this.#mount();
        
        const endpointFilter = this.#retrieveEndpointFilters();

        const expressAppHandlers = [endpointFilter, mainContextHandler(this.#httpContextClass)];

        this.#configuration.setServingFactors(expressAppHandlers);
        this.#ready = true;

        return expressAppHandlers;
    }

    /**
     * c
     * 
     * @returns {express.Router}
     */
    #retrieveEndpointFilters() {

        //const ret = [];

        const endpointFilter = express.Router();

        for (const routeGroup of this.#retriveControlersRouteGroup()) {
            
            endpointFilter.use(routeGroup);
        }

        return endpointFilter;
    }


    #registerControllerActionResutFilter() {

        const httpContextPipeline = this.#httpContextClass.pipeline;

        /**
         * Controller phase is a pipable phase that is a pipeline of Controllers
         * and the guarantee that with each incoming request, there is just one Controller 
         * handles the request despite of being managed to work sequencially. Base on 
         * the interupt mechanism, when a controller handles a request, it throws an ActionResult 
         * signal for httpcontext pipeline to catch and handle it.
         */
        //httpContextPipeline.onError();
    }

    #registerErrorHandlers() {

        /**@type {Pipeline} */
        const httpContextPipeline = this.#httpContextClass.pipeline;

        const configuration = this.#configuration;

        for (const handler of configuration.errorHandlers || []) {

            httpContextPipeline.onError(handler);
        }
    }

    #registerTopMiddlewares() {


    }

    #registerControllerResultFilter() {


    }

    #registerPreActionPhase() {


    }

    #registerPostActionPhase() {


    }

    *#retriveControlersRouteGroup() {
        
        for (const ControllerClass of this.#configuration.controllers.values()) {

            yield ControllerClass.configuration.retrieveIndepentdentGroup(ControllerClass);
        }
    }

    #registerControllerPhase() {

        const configuration = this.#configuration;
        
        const controllerPipeline = new Pipeline();

        this.#registerControllerPipelineActionResultFilter(controllerPipeline);

        for (const Controller of configuration.controllers.values() ?? []) {

            Controller._init();
            
            controllerPipeline.addPhase().setHandler(Controller).build();
        }
        
        const httpContextPipeline = this.#httpContextClass.pipeline;

        httpContextPipeline.addPhase().use(controllerPipeline).build();
    }

    /**
     * 
     * @param {Pipeline} _pipeline 
     */
    #registerControllerPipelineActionResultFilter(_pipeline) {
        
        _pipeline.onError(ActionResultFilter);
    }
}