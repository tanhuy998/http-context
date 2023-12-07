const ResponseResultBuilder = require("../../responseResult/responseResultBuilder");
const matchType = require('reflectype/src/libs/matchType');
const IActionResult = require("../iActionResult");
const ActionResult = require("../actionResult");

module.exports = class ActionResultValidator {

    /**@type {IActionResult} */
    #value;

    /**@type {IActionResult} */
    #result;

    /**@type {IActionResult} */
    get result() {

        return this.#result;
    }

    constructor(_value) {

        this.#value = _value;

        this.#init();
    }

    #init() {

        const initialValue = this.#value;

        if (matchType(IActionResult, initialValue)) {

            this.#result = initialValue;
        }

        this.#result = new ActionResult(initialValue);
    }
}