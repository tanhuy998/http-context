const CommitPolicy = require("./commitPolicy");
const ResponseResultBuilderComponentCommitmentStrategy = require("./responseResultBuilderComponentCommitmentStrategy");

module.exports = class CookieCommitment extends ResponseResultBuilderComponentCommitmentStrategy {

    constructor(_resCookieComponent, value) {

        super(_resCookieComponent, CommitPolicy.APPEND, value);
    }
}