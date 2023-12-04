const CarrierSignal = require("../../signal/signalType/carrierSignal");

module.exports = class ActionResultSignal extends CarrierSignal {

    get actionResult() {

        return super.data;
    }

    constructor(_controller, _actionResult) {

        super(_controller, _actionResult);
    }
}