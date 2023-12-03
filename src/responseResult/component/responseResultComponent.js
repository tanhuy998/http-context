module.exports = class ResponseResultComponent {

    #value;

    get value() {

        return this.#value;
    }

    /**
     * 
     * @param {any} _value 
     */
    constructor(_value) {

        this.#value = _value;
    }

    merge() {


    }

    append() {


    }

    prepend() {


    }

    overWrite() {

        
    }
}