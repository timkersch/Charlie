'use strict';

const dotenv = require('dotenv').config({path: '.env'});
const path = require('path');
const express = require('express');
const logger = require('morgan');

const mongoURL = process.env.MONGO_URL;
const mongoose = require('mongoose').connect(mongoURL);
const quizmodel = mongoose.model('Quiz', require('./models/quiz').Quiz);
const usermodel = mongoose.model('User', require('./models/user').Quiz);
const db = mongoose.connection;

const app = express();
const port = normalizePort(process.env.PORT || '8080');

const server = require('http').Server(app);

const sessionStore = require('sessionstore').createSessionStore({
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    dbName: 'charlie',
    collectionName: 'sessions',
    timeout: 10000
});

const session = require('express-session')({
    store: sessionStore,
    key: 'connect.sid',
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true
});

const socketHandler = require('./routes/socketHandler')(server, quizmodel, usermodel, sessionStore);

app.use(logger('dev'));
app.use(session);
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', function(req, res) {
    res.sendFile('/public/index.html');
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Development error handler - will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler - no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

db.on('error', console.error.bind(console, 'Mongodb connection error:'));
db.once('open', function() {
    console.log('Connected to Mongodb');
});

server.on('error', onError);
server.on('listening', onListening);
server.listen(port);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

module.exports = app;
