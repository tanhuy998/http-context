const ResponseResultComponent = require("./responseResultComponent");

module.exports = class ResponseHeaderComponent extends ResponseResultComponent{

    /**
     * 
     * @param {Object} _headers 
     */
    constructor(_headers) {

        super(_headers);

        this.#init();
    }

    #init() {

        
    }
}