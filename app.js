'use strict';

const dotenv = require('dotenv').config({path: '.env'});
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookParse = require('cookie');
const spotify = require('./core/spotify-service.js');
const express = require('express');
const sessionStore = require('sessionstore').createSessionStore();

const expressSession = require('express-session');
const session = expressSession({
    store: sessionStore,
    key: 'connect.sid',
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true
});

const uids = {};

const app = express();

app.use(session);

const openRooms = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/webapp/index.html');
});

app.use(express.static('webapp'));

const server = require('http').Server(app);
server.listen(8080, function() {
    console.log('Listening on 8080');
});

const io = require('socket.io')(server);

io.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
        data.cookie = cookParse.parse(data.headers.cookie);
        data.sessionID = cookieParser.signedCookie(data.cookie['connect.sid'], process.env.COOKIE_SECRET);
        sessionStore.load(data.sessionID, function(err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                data.session = session;
                accept(null, true);
            }
        });
    } else {
        return accept('No cookie transmitted', false);
    }
});

io.on('connection', function(socket){
    console.log('connection');
    let cookie =  cookParse.parse(socket.handshake.headers.cookie);
    let session_id = cookieParser.signedCookie(cookie['connect.sid'], process.env.COOKIE_SECRET);

    if (session_id) {
        socket.on('getLoginURL', function () {
            console.log("in getURL");
            const url = spotify.getRedirectURL();
            socket.emit('getLoginURLCallback', url);
        });

        socket.on('login', function (code) {
            console.log("in login", code);
            const tokenPromise = spotify.getTokens(code);
            sessionStore.load(session_id, function (err, storage) {
                tokenPromise.then((result) => {
                    storage.tokens = {
                        access_token: result['access_token'],
                        refresh_token: result['refresh_token']
                    };
                    new spotify.SpotifyApi(storage.tokens).getUser().then((user) => {
                        storage.user = user.id;
                        sessionStore.set(session_id, storage);

                        const returnObj = {
                            id : user.id,
                            email : user.email,
                            country : user.country,
                            product : user.product
                        };
                        socket.emit('loginCallback', returnObj);
                    });
                });
            });
        });

        socket.on('getPlaylists', function () {
            console.log("in getPlaylists");
            sessionStore.load(session_id, function (err, storage) {
                new spotify.SpotifyApi(storage.tokens).getPlaylists().then((playlists) => {
                    socket.emit('getPlaylistsCallback', playlists);
                });
            });
        });

        socket.on('createQuiz', function (quiz) {
            console.log("in createQuiz", quiz);
            sessionStore.load(session_id, function (err, storage) {
                const uid = generateUID();
                const quizDetails = quiz;
                socket.join(uid);

                quizDetails.id = uid;
                quizDetails.owner = storage.user;
                quizDetails.users.push(storage.user);

                openRooms.push(quizDetails);

                storage.quizID = uid;
                sessionStore.set(session_id, storage);

                socket.emit('createQuizCallback', quizDetails);
            });
        });

        socket.on('joinQuiz', function (room) {
            sessionStore.load(session_id, function (err, storage) {
                console.log("in joinQuiz", room);
                console.log("the open rooms are", openRooms);
                // The user joins a room
                    for(let i = 0; i < openRooms.length; i++) {
                        if (openRooms[i].id === room) {
                            // Push the new user to the list of users
                            openRooms[i].users.push(storage.user);

                            // Join the room
                            socket.join(room);

                            // Emit result back to client
                            socket.emit('joinQuizCallback', openRooms[i]);

                            // Emit to room that user with name joined
                            return io.to(room).emit('userJoined', storage.user);
                        }
                    }
                socket.emit('joinQuizCallback');
            });
        });

        socket.on('nextQuestion', function (msg) {
            console.log("in nextQuestion", msg);
            sessionStore.load(session_id, function(err, storage) {
                io.to(storage.quizID).emit('quizStart', {});
            });
        });

        socket.on('getCurrentQuestion', function (msg) {
            console.log("in getCurrentQuestion", msg);
        });

        socket.on('leaveQuiz', function (id, msg) {
            console.log("in leaveQuiz", msg);
        });

        socket.on('isQuizStarted', function (msg) {
            console.log("in isQuizStarted", msg);
        });

        socket.on('getUsers', function (id, msg) {
            console.log("in getUsers", msg);
        });

        socket.on('getUsersInQuiz', function (id, msg) {
            console.log("in getUsersInQuiz", msg);
        });

        socket.on('logout', function (id, msg) {
            console.log("in logout", msg);
        });

        socket.on('getResults', function (id, msg) {
            console.log("in getResults", msg);
        });

        socket.on('getQuiz', function (id, msg) {
            console.log("in getQuiz", msg);
        });

        socket.on('savePlaylist', function (id, msg) {
            console.log("in savePlaylist", msg);
        });

        socket.on('getUserResults', function (id, msg) {
            console.log("in getUserResults", msg);
        });

        socket.on('answerQuestion', function (id, msg) {
            console.log("in answerQuestion", msg);
        });

        socket.on('disconnect', function () {
            console.log("in disconnect");
        });

        socket.on('setUser', function (msg) {
            console.log('in set user', msg);
            socket.emit('setUserCallback');
        });
    }
});

function generateUID() {
    let uid = getUID();
    while (uids.uid) {
        uid = getUID();
    }
    uids.uid = true;
    return uid;
}

function getUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
}

module.exports = app;









// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//app.use('/', routes);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handlers
//
// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     //res.render('error', {
//       //message: err.message,
//       //error: err
//     //});
//   });
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   //res.render('error', {
//     //message: err.message,
//     //error: {}
//   //});
// });
