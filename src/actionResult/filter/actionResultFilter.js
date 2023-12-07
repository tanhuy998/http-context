const { ACTION_RESULT } = require("../../controller/signal");
const SignalConsumer = require("../../signal/pipeline/signalConsumer");
const HttpController = require('../../controller/httpController');
const IActionResult = require("../iActionResult");
const { NO_ACTION_RESULT } = require("./constant");
const ActionResultValidator = require("./actionResultValidator");

/**
 * ActionResultFilter is setted on the controller pipeline phase of the HttpContext pipeline
 */
module.exports = class ActionResultFilter extends SignalConsumer {

    acceptPublisher = [HttpController]

    handle() {

        console.log('catch action result signal from', this.breakPoint.publisher);

        const signalValue = this.signal?.value;

        const validator = new ActionResultValidator(signalValue);
        const actionResult = validator.result;

        const responseResult = actionResult.resolveResult();

        this.breakPoint.rollbackPayload.trace.push(responseResult);

        this.pass();
    }
}