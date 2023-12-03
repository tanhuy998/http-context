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

    merge(_value) {

        this.#value = Object.assign(this.#value, _value);
    }

    append() {

        this.merge(_value);
    }

    prepend(_value) {

        this.merge(_value);
    }

    overWrite(_value) {

        this.#value = _value;
    }
}