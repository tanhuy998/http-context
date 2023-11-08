module.exports = class ControllerHandlingState {

    static get SYNC() {

        return 1;
    }

    static get ASYNC() {

        return 0;
    }
}