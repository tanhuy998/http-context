const {implement} = require('reflectype/src/decorators');
const IActionResult = require('./iActionResult');
const HttpContext = require('../httpContext.js');
const ResponseResultBuilder = require('../responseResult/responseResultBuilder.js');

const proto = module.exports = class ActionResult {

    /**@type {HttpContext} */
    #httpContext;

    #value;

    get value() {

        return this.#value;
    }

    /**
     * 
     * @param {any} value 
     * @param {HttpContext} httpContext 
     */
    constructor(actionValue, httpContext) {

        this.#value = actionValue;
        this.#httpContext = httpContext

        this.#init();
    }

    #init() {

        
    }

    resolveResult() {

        return new ResponseResultBuilder(this.#httpContext.response);
    }
}

/**
 * implement IActionResult interface
 */
implement(IActionResult)(proto, {kind: 'class'});