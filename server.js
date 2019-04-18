'use strict';

// ES6 ?
// import express from 'express';
// import morgan from 'morgan';

const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.static('public'));



if (require.main === module) {
    app.listen(process.env.PORT || 8080);
    console.log(`App is listening on port: 8080`)
}

module.exports = app;
