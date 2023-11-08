require('@babel/register')({
    only: [
        /controller/
    ]
})

const express = require('express');
const app = express();

const port = 3000;

const HttpContext = require('../../src/httpContext');
const Controller = require('./controller/controller');
const { error } = require('console');

//HttpContext.pipeline.addPhase().setHandler(Controller).build();

HttpContext.use(Controller);

//app.use(Controller.serve());

app.use(HttpContext.serve());

app.listen(port, (error) => {

    if (error) {

        throw error;
    }

    console.log('app listen on port', port);
})