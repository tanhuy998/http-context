const { ErrorHandler } = require("isln/handler");

module.exports = class ActionResultFilter extends ErrorHandler {

    accept = [
        
    ]

    handle() {

        const origin = this.originError;

        const httpContext = this.context;

        console.log('action result', origin);
    }
}