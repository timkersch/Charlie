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
const middleware = require('./core/middleware');

const app = express();
const port = (process.env.PORT || 8080);

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
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true
});

passport.use(new SpotifyStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({'userID': profile.id}, function(err, user) {
                if(err) {
                    return done(err);
                }

                if(!user) {
                    let name = profile.id;
                    if(profile.displayName) {
                        name = profile.displayName;
                    }

                    const newUser = new User({
                        userID: profile.id,
                        name: name,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        country: profile.country,
                        email: profile._json.email,
                        product: profile.product
                    });
                    newUser.save(function(error) {
                        if(error) {
                            console.log('Error when saving new user', error);
                        }
                        return done(null, newUser);
                    });
                } else {
                    user.accessToken = accessToken;
                    user.refreshToken = refreshToken;
                    user.save(function(error) {
                        if(error) {
                            console.log('Error when updating user', error);
                        }
                        return done(null, user);
                    });
                }
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.userID);
});

passport.deserializeUser(function(id, done) {
    User.findOne({'userID': id}, function(err, user) {
        done(err, user);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(require('./core/authEndpoints')(passport));
app.use(require('./core/apiEndpoints')(Quiz));

app.get('*', middleware.ensureAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if(process.env.NODE_ENV === 'production') {
        res.json({
            message: err.message,
            error: err
        });
    } else {
        res.json({
            message: err.message,
            error: {}
        });
    }
});

db.on('error', console.error.bind(console, 'Mongodb connection error:'));
db.once('open', function() {
    console.log('Connected to Mongodb');
});

server.on('error', function(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

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
});

server.on('listening', function() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});

require('./core/socketEndpoints')(server, sessionStore, Quiz);
server.listen(port);