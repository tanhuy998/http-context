const CommitPolicy = require("./commitPolicy");
const ResponseResultBuilderComponentCommitmentStrategy = require("./responseResultBuilderComponentCommitmentStrategy");

module.exports = class HeaderCommitment extends ResponseResultBuilderComponentCommitmentStrategy {

    constructor(_resHeaderComponent, value) {

        super(_resHeaderComponent, CommitPolicy.APPEND, value);
    }
}