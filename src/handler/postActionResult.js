const { ContextHandler } = require("isln/handler");
const {CONSTRUCTOR} = require('isln/src/dependencies/constants.js');
const IActionResult = require("../actionResult/iActionResult");
const { decoratePseudoConstructor } = require("isln/src/utils/metadata");
/**
 * @typedef {import('../httpContext.js')} HttpContext
 */

const proto = module.exports = class PostActionResult extends ContextHandler {

    /**@type {IActionResult} */
    #actionResult;

    /**
     * 
     * @param {IActionResult} _iActionResult 
     */
    [CONSTRUCTOR](_iActionResult) {

        this.#actionResult = _iActionResult;
    }

    handle() {

        /**@type {HttpContext} */
        const httpContext = this.context;
        const responseResult = this.#actionResult.resolveResult();

        responseResult.setSocket(httpContext.response);
        console.log('post action', responseResult)
        responseResult.send();
    }
}

decoratePseudoConstructor(proto, {
    defaultParamsType: [IActionResult]
})