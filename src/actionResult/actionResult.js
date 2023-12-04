const {implement} = require('reflectype/src/decorators');
const IActionResult = require('./iActionResult');
const HttpContext = require('../httpContext.js');
const ResponseResultBuilder = require('../responseResult/responseResultBuilder.js');

/**
 * ActionResult parses a controller returned value that did not implement IActionResult iterface
 * into a implementation of IActionResult. It's treat the returned value as the body of response, 
 * headers is set by default.
 * 
 *  example: 
 * 
 *  class Controller extends HttpController {
 *      
 *      @Route.get('/')
 *      index() {
 *          
 *          // the returned object will be wrapped into ActionResult
 *          // and the object will be the response's body
 *          return {message: 'hello'};
 *      }
 *      
 *      @Route.get('/index')
 *      about() {
 *          
 *          // this line returns instance of ResponseResultBuilder
 *          return this.status('/');
 *      }
 *  }
 */
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
    constructor(actionValue) {

        this.#value = actionValue;
        //this.#httpContext = httpContext

        this.#init();
    }

    #init() {

        
    }

    resolveResult() {

        const resBody = this.#value;

        return new ResponseResultBuilder(this.#httpContext.response)
                    .body(resBody)
                    .resoleResult();
    }
}

/**
 * implement IActionResult interface
 */
implement(IActionResult)(proto, {kind: 'class'});