module.exports = class ResponseResultBuilderComponentCommitmentStrategy {

    #component;
    #action;
    #value;

    constructor(_responseResultComponent, _action, _value) {

        this.#component = _responseResultComponent;
        this.#action = _action;
        this.#value = _value;
        
    }

    static commit() {

        
    }
}