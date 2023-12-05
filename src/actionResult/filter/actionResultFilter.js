const { ACTION_RESULT } = require("../../controller/signal");
const SignalConsumer = require("../../signal/pipeline/signalConsumer");
const IActionResult = require("../iActionResult");
const { NO_ACTION_RESULT } = require("./constant");

/**
 * ActionResultFilter is setted on the controller pipeline phase of the HttpContext pipeline
 */
module.exports = class ActionResultFilter extends SignalConsumer {


    handle() {

        console.log('catch action result signal');

        if (!this.signal?.value) {

            throw NO_ACTION_RESULT;
        }

        this.#finishControllerPipeline();
    }

    #finishControllerPipeline() {

        this.abort();
    }
}