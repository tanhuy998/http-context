module.exports = class CommitPolicy {

    static get APPEND() {

        return 'append';
    }

    static get MERGE() {

        return 'merge';
    }

    static get PREPEND() {

        return 'prepend';
    }

    static get OVER_WRITE() {

        return 'overWrite';
    }
}