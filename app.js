'use strict';

const dotenv = require('dotenv').config({path: '.env', silent: true});
const path = require('path');
const express = require('express');
const logger = require('morgan');

const mongoURL = process.env.MONGODB_URI;
const mongoose = require('mongoose').connect(mongoURL);
const db = mongoose.connection;

const Quiz = mongoose.model('Quiz', require('./models/quiz').Quiz);
const User = mongoose.model('User', require('./models/user').User);

const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

const app = express();
const port = normalizePort(process.env.PORT || '8080');

const scope = ['playlist-read-private', 'playlist-read-collaborative',
    'playlist-modify-private', 'playlist-modify-public', 'user-read-email', 'user-read-private'];

const server = require('http').Server(app);

const sessionStore = require('sessionstore').createSessionStore({
    type: 'mongodb',
    url: mongoURL,
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

const socketHandler = require('./core/socketHandler')(server, Quiz, User, sessionStore);

app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new SpotifyStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({'id': profile.id}, function(err, user) {
            console.log(user);
            if(err) {
                return done(err);
            }
            if(!user) {
                user = new User({
                    userID: profile.id,
                    country: profile.country,
                    email: profile._json.email,
                    product: profile.product,
                    quizIDS: []
                });
                user.save(function(err) {
                    if(err) {
                        console.log('Error when saving new user');
                    }
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/auth/spotify', passport.authenticate('spotify', {scope: scope, showDialog: true}), function(req, res){
    // The request will be redirected to spotify for authentication
});

app.get('/auth/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/' }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

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
        res.json({
            message: err.message,
            error: err
        });
    });
}

// Production error handler - no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
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
