const { ContextHandler } = require("isln/handler");
const express = require('express');

function endpointFilter(_filter) {

    return class EndpointFilter extends ContextHandler {

        handle() {

            const req = this.context.request;
            const res = this.context.response;

            console.log('endpoint filter')

            _filter.handle(req, res, function() {});
        }
    }
}

module.exports = endpointFilter;