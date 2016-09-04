'use strict';

const dotenv = require('dotenv').config({path: '.env'});
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const cookParse = require('cookie');
const spotify = require('./core/spotify-service.js');
const express = require('express');

// const mongoClient = require('mongodb').MongoClient;
// mongoClient.connect(mongoURL, function(err, db) {
//     if(err === null) {
//         console.log('Connected to Mongodb');
//     }
// });

const mongoURL = 'mongodb://localhost:27017/charlie';
const mongoose = require('mongoose');
mongoose.connect(mongoURL);
const db = mongoose.connection;

const Quiz = mongoose.model('Quiz', require('./core/schemas').Quiz);

db.on('error', console.error.bind(console, 'Mongodb connection error:'));
db.once('open', function() {
    console.log('Connected to Mongodb');
});

const sessionStore = require('sessionstore').createSessionStore({
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    dbName: 'charlie',
    collectionName: 'sessions',
    timeout: 10000
    // authSource: 'authedicationDatabase',
    // username: 'technicalDbUser',
    // password: 'secret'
    // url: 'mongodb://user:pass@host:port/db?opts
});

const expressSession = require('express-session');
const session = expressSession({
    store: sessionStore,
    key: 'connect.sid',
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true
});

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

                const newQuiz = new Quiz({
                    quizID: uid,
                    name: quizDetails.name,
                    generated: quizDetails.generated,
                    owner: storage.user,
                    playlist: quizDetails.playlist,
                    nbrOfSongs: quizDetails.nbrOfSongs,
                    started: false,
                    finished: false,
                    players: [{
                        userID: storage.user,
                        answers: [],
                        points: 0,
                    }]
                });

                const api = new spotify.SpotifyApi(storage.tokens);
                getQuestions(api, quizDetails.playlist, storage.user, quizDetails.nbrOfSongs).then((result) => {
                    newQuiz.questions = result;
                    newQuiz.save(function(err) {
                        if(err) {
                            console.log('error when saving quiz!', err);
                        } else {
                            console.log('saved quiz!');
                        }
                    });
                    quizDetails.quizID = uid;
                    quizDetails.owner = storage.user;
                    socket.emit('createQuizCallback', quizDetails);
                });
            });
        });

        socket.on('joinQuiz', function (room) {
            console.log("in joinQuiz", room);

            sessionStore.load(session_id, function (err, storage) {
                // The user joins a room
                Quiz.findOne({'quizID': room}, function(err, quiz) {
                    if(err) {
                        console.log('error', err);
                    } else {
                        if(quiz.started === false && quiz.finished === false) {
                            // Join the room
                            socket.join(room);
                            storage.quizID = room;
                            sessionStore.set(session_id, storage);

                            quiz.players.push({userID: storage.user, answers: [], points: 0});
                            quiz.save(function (err) {
                                if(!err) {
                                    console.log('error when saving quiz!', err);
                                } else {
                                    console.log('saved quiz!');
                                }
                            });

                            // Emit result back to client
                            socket.emit('joinQuizCallback', {
                                quizID: quiz.quizID,
                                name: quiz.name,
                                generated: quiz.generated,
                                owner: quiz.owner,
                                playlist: quiz.playlist,
                                nbrOfSongs: quiz.nbrOfSongs,
                                players: quiz.players,
                            });

                            // Emit to room that user with name joined
                            io.to(room).emit('userJoined', storage.user);
                        } else {
                            socket.emit('joinQuizCallback');
                        }
                    }
                });
            });
        });

        socket.on('startQuiz', function() {
            console.log('in startQuiz');
            sessionStore.load(session_id, function (err, storage) {
                Quiz.update({'quizID': storage.quizID}, {$set: {started: true, questionIndex: 0}}, function (err) {
                    if (err) {
                        console.log('error', err);
                    } else {
                        io.to(storage.quizID).emit('quizStart');
                    }
                });
            });
        });

        socket.on('nextQuestion', function () {
            console.log("in nextQuestion");
            sessionStore.load(session_id, function (err, storage) {
                Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
                    if (quiz.questionIndex + 1 < quiz.questions.length) {
                        const nextQuestion = quiz.questions[++quiz.currentQuestionsNumber];
                        quiz.save(function (err) {
                            if (err) {
                                console.log('err', err);
                            } else {
                                io.to(storage.quizID).emit('newQuestion', nextQuestion);
                            }
                        });
                    } else {
                        quiz.finished = true;
                        quiz.save(function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('done');
                            };
                        });
                    }
                });
            });
        });

        socket.on('getCurrentQuestion', function () {
            console.log('in get current question');
            sessionStore.load(session_id, function (err, storage) {
                Quiz.findOne({'quizID': storage.quizID}, 'questionIndex questions', function (err, quiz) {
                    io.to(storage.quizID).emit('getCurrentQuestionCallback', quiz.questions[quiz.questionIndex]);
                });
            });
        });

        socket.on('answerQuestion', function (answer) {
            console.log("in answerQuestion", data);

            sessionStore.load(session_id, function (err, storage) {
                Quiz.findOne({'quiID': storage.quizID}, function (err, quiz) {
                    if(answer === quiz.questions[quiz.questionIndex].correctArtist) {
                        quiz.players.forEach(function (player) {
                            if (player.userID === storage.user) {
                                player.points++;
                                player.answers[quiz.questionIndex] = answer;
                                return quiz.save(function(err) {
                                    if(err) {
                                        console.log('error', err);
                                    } else {
                                        return io.to(storage.quizID).emit('userPointsUpdate', player);
                                    }
                                });
                            }
                        });
                    }
                });
            });
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
        tracks.forEach(function(track) {
            const t = track.track;
            const artist = t.artists[0];
            questions.push(new Promise((resolve, reject) => {
                api.getArtistOptions(artist.id).then((relatedArtists) => {
                    relatedArtists.push(artist.name);
                    resolve ({
                        trackID: t.id,
                        trackName: t.name,
                        albumName : t.album.name,
                        correctArtist: artist.name,
                        trackUrl : t.preview_url,
                        artistOptions : relatedArtists
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
    // TODO
    let uid;
    do {
        return uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
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
