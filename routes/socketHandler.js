'use strict';
/**
 * Created by Tim on 04/09/16.
 */

module.exports = function(server, quizmodel, usermodel, sessionStore) {
    const utils = require('../core/helpers');
    const io = require('socket.io')(server);
    const cookieParser = require('cookie-parser');
    const cookParse = require('cookie');
    const spotify = require('../core/spotifyService.js');
    const Quiz = quizmodel;
    const User = usermodel;

    io.set('authorization', function (data, accept) {
        if (data.headers.cookie) {
            data.cookie = cookParse.parse(data.headers.cookie);
            data.sessionID = cookieParser.signedCookie(data.cookie['connect.sid'], process.env.COOKIE_SECRET);
            sessionStore.load(data.sessionID, function (err, session) {
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

    io.on('connection', function (socket) {
        console.log('Client connected');
        let cookie = cookParse.parse(socket.handshake.headers.cookie);
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
                            storage.user = user.userID;
                            sessionStore.set(session_id, storage);
                            socket.emit('loginCallback', user);
                        });
                    });
                });
            });

            socket.on('getPlaylists', function () {
                console.log("in getPlaylists");
                sessionStore.load(session_id, function (err, storage) {
                    if(storage.user && storage.tokens) {
                        new spotify.SpotifyApi(storage.tokens).getPlaylists().then((playlists) => {
                            socket.emit('getPlaylistsCallback', playlists);
                        });
                    }
                });
            });

            socket.on('createQuiz', function (quizDetails) {
                console.log("in createQuiz", quizDetails);
                sessionStore.load(session_id, function (err, storage) {
                    if(storage.user) {
                        const api = new spotify.SpotifyApi(storage.tokens);
                        api.getQuizQuestions(quizDetails.playlist, quizDetails.nbrOfSongs, quizDetails.generated, quizDetails.playlistOwner).then((result) => {
                            const uid = utils.generateUID();
                            socket.join(uid);

                            storage.quizID = uid;
                            sessionStore.set(session_id, storage);

                            const newQuiz = new Quiz({
                                quizID: uid,
                                name: quizDetails.name,
                                generated: quizDetails.generated,
                                owner: storage.user,
                                playlistOwner: quizDetails.playlistOwner,
                                nbrOfSongs: quizDetails.nbrOfSongs,
                                started: false,
                                finished: false,
                                playlist: {
                                    id: quizDetails.playlist,
                                    owner: quizDetails.playlistOwner,
                                    generated: quizDetails.generated,
                                },
                                players: [{
                                    userID: storage.user,
                                    answers: utils.initArr(quizDetails.nbrOfSongs),
                                    points: 0,
                                }]
                            });
                            newQuiz.questions = result;
                            newQuiz.save(function (err) {
                                if (err) {
                                    console.log('error when saving quiz!', err);
                                }
                            });
                            quizDetails.quizID = uid;
                            quizDetails.owner = storage.user;
                            socket.emit('createQuizCallback', quizDetails);
                        }).catch((err) => {
                            socket.emit('createQuizCallback', {error: 'Could not create quiz. Try reducing the number of questions'});
                        });
                    }
                });
            });

            socket.on('joinQuiz', function (data) {
                console.log("in joinQuiz", data);
                const room = data.room || data;
                sessionStore.load(session_id, function (err, storage) {
                    // The user joins a room
                    Quiz.findOne({'quizID': room}, function (err, quiz) {
                        if (err || !quiz) {
                            socket.emit('joinQuizCallback', {error: 'Quiz is not available!'});
                        } else {
                            if (quiz.started === false && quiz.finished === false) {
                                if(data.username) {
                                    for(let i = 0; i < quiz.players.length; i++) {
                                        if(quiz.players.userID === data.username) {
                                            return socket.emit('joinQuizCallback', {error: 'Username not available!'});
                                        }
                                    }
                                    storage.user = data.username;
                                }
                                // Join the room
                                socket.join(room);
                                storage.quizID = room;
                                sessionStore.set(session_id, storage);

                                quiz.players.push({userID: storage.user, answers: utils.initArr(quiz.nbrOfSongs), points: 0});
                                quiz.save(function (err) {
                                    if (err) {
                                        console.log('error when saving quiz!', err);
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
                                socket.emit('joinQuizCallback', {error: 'Quiz is not available!'});
                            }
                        }
                    });
                });
            });

            socket.on('nextQuestion', function () {
                console.log("in nextQuestion");
                sessionStore.load(session_id, function (err, storage) {
                    if(storage.user && storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
                            if(storage.user === quiz.owner) {
                                if (quiz.started === false) {
                                    quiz.questionIndex = 0;
                                    quiz.started = true;
                                    io.to(storage.quizID).emit('quizStart');
                                } else {
                                    quiz.questionIndex++;
                                }
                                if (quiz.questionIndex < quiz.questions.length) {
                                    const nextQuestion = quiz.questions[quiz.questionIndex];
                                    io.to(storage.quizID).emit('newQuestion', {
                                        question: nextQuestion,
                                        questionIndex: quiz.questionIndex
                                    });
                                    utils.countDown(25, io, storage.quizID);
                                    quiz.save(function (err) {
                                        if (err) {
                                            console.log('error in nextQuestion', err);
                                        }
                                    });
                                } else {
                                    quiz.finished = true;
                                    quiz.save(function (err) {
                                        if (err) {
                                            console.log('error in nextQuestion save to mongo', err);
                                        } else {
                                            io.to(storage.quizID).emit('gameOver');
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            });

            socket.on('getCurrentQuestion', function () {
                console.log('in getCurrentQuestion');

                sessionStore.load(session_id, function (err, storage) {
                    if(storage.user && storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, 'questionIndex questions', function (err, quiz) {
                            socket.emit('getCurrentQuestionCallback', {
                                question: quiz.questions[quiz.questionIndex],
                                questionIndex: quiz.questionIndex
                            });
                        });
                    }
                });
            });

            socket.on('getResults', function () {
                console.log("in getResults");

                sessionStore.load(session_id, function (err, storage) {
                    if(storage.user && storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, 'players', function (err, quiz) {
                            socket.emit('getResultsCallback', quiz.players);
                        });
                    }
                });
            });

            socket.on('answerQuestion', function (answer) {
                console.log("in answerQuestion", answer);

                sessionStore.load(session_id, function (err, storage) {
                    if(storage.user && storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
                            quiz.players.forEach(function (player) {
                                if (player.userID === storage.user) {
                                    player.answers.set(quiz.questionIndex, answer);
                                    if (answer === quiz.questions[quiz.questionIndex].correctArtist) {
                                        player.points++;
                                        io.to(storage.quizID).emit('userPointsUpdate', player);
                                    }
                                    return quiz.save(function (err) {
                                        if (err) {
                                            console.log('error in answerQuestion', err);
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            });

            socket.on('isQuizStarted', function () {
                console.log("in isQuizStarted");
                sessionStore.load(session_id, function (err, storage) {
                    Quiz.findOne({'quizID': storage.quizID}, 'started', function (err, quiz) {
                        socket.emit('isQuizStartedCallback', quiz.started);
                    });
                });
            });

            socket.on('getQuiz', function () {
                console.log("in getQuiz");
                sessionStore.load(session_id, function (err, storage) {
                    Quiz.findOne({'quizID': storage.quizID}, '-players -questions', function (err, quiz) {
                        socket.emit('getQuizCallback', quiz);
                    });
                });
            });

            socket.on('savePlaylist', function () {
                console.log("in savePlaylist");
                sessionStore.load(session_id, function (err, storage) {
                    Quiz.findOne({'quizID': storage.quizID}, 'name questions', function (err, quiz) {
                        const api = new spotify.SpotifyApi(storage.tokens);
                        api.savePlaylist(storage.user, quiz.name, quiz.questions);
                    });
                });
            });

            socket.on('leaveQuiz', function () {
                console.log("in leaveQuiz");
                sessionStore.load(session_id, function (err, storage) {
                    storage.quizID = undefined;
                })
            });

            socket.on('logout', function () {
                console.log("in logout");
                sessionStore.load(session_id, function (err, storage) {
                    storage.quizID = undefined;
                    storage.user = undefined;
                    storage.tokens = undefined;
                    sessionStore.set(session_id, storage);
                });
            });

            socket.on('disconnect', function () {
                console.log("Client disconnected");
            });
        }
    });
};