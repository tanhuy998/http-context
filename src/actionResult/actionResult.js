const {implement} = require('reflectype/src/decorators');
const IActionResult = require('./iActionResult');
const ResponseResultBuilder = require('../responseResult/responseResultBuilder.js');

/**
 * @typedef {import('../responseResult/responseResult.js')} Responseresult
 */

const DEFAULT_STATUS_CODE = 200;

/**
 * ActionResult tranform a controller returned value that did not implement IActionResult iterface
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

    #value;

    get value() {

        return this.#value;
    }

    /**
     * 
     * @param {any} value 
     */
    constructor(actionValue) {

        this.#value = actionValue;

        this.#init();
    }

    #init() {

        this.#transformValue();
    }

    #transformValue() {


    }

    /**
     * 
     * @returns {Responseresult}
     */
    resolveResult() {

        const resBody = this.#value;

        return new ResponseResultBuilder(DEFAULT_STATUS_CODE)
                    .body(resBody)
                    .resolveResult();
    }
}

/**
 * implement IActionResult interface
 */
implement(IActionResult)(proto, {kind: 'class'});