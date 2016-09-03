'use strict';

const dotenv = require('dotenv').config({path: '.env'});
const path = require('path');
const favicon = require('serve-favicon');
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

const openRooms = {};

const app = express();

app.use(session);

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

        socket.on('createQuiz', function (quizDetails) {
            console.log("in createQuiz", quizDetails);
            sessionStore.load(session_id, function (err, storage) {
                const uid = generateUID();
                socket.join(uid);

                storage.quizID = uid;
                sessionStore.set(session_id, storage);

                quizDetails.id = uid;
                quizDetails.owner = storage.user;
                quizDetails.users.push(storage.user);
                const obj = {
                    started: false,
                    quiz: quizDetails
                };

                const api = new spotify.SpotifyApi(storage.tokens);
                getQuestions(api, quizDetails.playlist, storage.user, quizDetails.nbrOfSongs).then((result) => {
                    obj.questions = result;
                    openRooms[uid] = obj;
                    socket.emit('createQuizCallback', obj.quiz);
                });
            });
        });

        socket.on('joinQuiz', function (room) {
            sessionStore.load(session_id, function (err, storage) {
                console.log("in joinQuiz", room);
                // The user joins a room
                if (openRooms[room] && openRooms[room].started === false) {
                    // Push the new user to the list of users
                    openRooms[room].quiz.users.push(storage.user);

                    // Join the room
                    socket.join(room);

                    // Emit result back to client
                    socket.emit('joinQuizCallback', openRooms[room].quiz);

                    // Emit to room that user with name joined
                    return io.to(room).emit('userJoined', storage.user);
                }
                socket.emit('joinQuizCallback');
            });
        });

        socket.on('startQuiz', function(quizID) {
            console.log('in startQuiz', quizID);
            openRooms[quizID].started = true;
            io.to(quizID).emit('quizStart');
        });

        socket.on('nextQuestion', function (quizID) {
            console.log("in nextQuestion", quizID);
            io.to(quizID).emit('newQuestion', openRooms[quizID].questions[1]);
        });

        socket.on('getCurrentQuestion', function (quizID) {
            console.log('in get current question', quizID);
            io.to(quizID).emit('getCurrentQuestionCallback', openRooms[quizID].questions[0]);
        });

        socket.on('answerQuestion', function (answer) {
            console.log("in answerQuestion", answer);
        });

        socket.on('leaveQuiz', function (msg) {
            console.log("in leaveQuiz", msg);
        });

        socket.on('isQuizStarted', function (msg) {
            console.log("in isQuizStarted", msg);
        });

        socket.on('getUsers', function (msg) {
            console.log("in getUsers", msg);
        });

        socket.on('getUsersInQuiz', function (msg) {
            console.log("in getUsersInQuiz", msg);
        });

        socket.on('logout', function (msg) {
            console.log("in logout", msg);
        });

        socket.on('getResults', function (msg) {
            console.log("in getResults", msg);
        });

        socket.on('getQuiz', function (msg) {
            console.log("in getQuiz", msg);
        });

        socket.on('savePlaylist', function (msg) {
            console.log("in savePlaylist", msg);
        });

        socket.on('getUserResults', function (msg) {
            console.log("in getUserResults", msg);
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

function getQuestions(api, playlistId, ownerId, noTracks) {
    return api.getPlaylistTracks(playlistId, ownerId).then((data) => {
        const tracks = data.slice(0, noTracks);
        const questions = [];
        tracks.forEach(function(track, i) {
            const t = track.track;
            const artist = t.artists[0];
            questions.push(new Promise((resolve, reject) => {
                api.getArtistOptions(artist.id).then((relatedArtists) => {
                    relatedArtists.push(artist.name);
                    resolve ({
                        id: t.id,
                        name: t.name,
                        album : t.album.name,
                        correct: artist.name,
                        track_url : t.preview_url,
                        artists : relatedArtists,
                        answer : '',
                        number: i+1
                    });
                }).catch((err) => {
                    reject(err);
                });
            }));
        });
        return Promise.all(questions).then((result) => {
            return result;
        });
    }).catch((err) => {
        console.log(err);
    });
}

function generateUID() {
    let uid;
    do {
        uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    } while (openRooms.uid);
    return uid;
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
