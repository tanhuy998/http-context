const CommitPolicy = require("./commitPolicy");
const ResponseResultBuilderComponentCommitmentStrategy = require("./responseResultBuilderComponentCommitmentStrategy");

module.exports = class bodyCommitment extends ResponseResultBuilderComponentCommitmentStrategy {

    constructor(_resBodyComponent, value) {

        super(_resBodyComponent, CommitPolicy.OVER_WRITE, value);
    }
}