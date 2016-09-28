'use strict';
/**
 * Created by Tim on 04/09/16.
 */

module.exports = function(server, quizmodel, usermodel, sessionStore) {
    const utils = require('./helpers');
    const io = require('socket.io')(server);
    const passportSocketIo = require('passport.socketio');
    const cookieParser = require('cookie-parser');
    const cookParse = require('cookie');
    const spotify = require('./spotifyService.js');
    const Quiz = quizmodel;

    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        secret:       process.env.COOKIE_SECRET,
        store:        sessionStore,
        success:      onAuthorizeSuccess,
        fail:         onAuthorizeFail,
    }));

    function onAuthorizeSuccess(data, accept){
        console.log('successful connection to socket.io');
        accept();
    }

    function onAuthorizeFail(data, message, error, accept){
        console.log('connection not authorized');
        if(error)
            accept(new Error(message));
    }

    io.on('connection', function (socket) {
        console.log('Client connected');
        let cookie = cookParse.parse(socket.handshake.headers.cookie);
        let session_id = cookieParser.signedCookie(cookie['connect.sid'], process.env.COOKIE_SECRET);

        if (session_id) {

            sessionStore.load(session_id, function(err, storage) {
                if(storage.quizID) {
                    socket.join(storage.quizID);
                    Quiz.findOne({'quizID': storage.quizID}, 'players', function (err, quiz) {
                        for(let i = 0; i < quiz.players.length; i++) {
                            if(quiz.players[i].userID === storage.user) {
                                io.to(storage.quizID).emit('userJoined', quiz.players[i]);
                                break;
                            }
                        }
                    });
                }
            });

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
                            storage.spotifyAuthed = true;
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
                        api.getQuizQuestions(quizDetails.playlistID, quizDetails.nbrOfSongs, quizDetails.shuffle, quizDetails.playlistOwner).then((result) => {
                            const uid = utils.generateUID();
                            socket.join(uid);

                            storage.quizID = uid;
                            sessionStore.set(session_id, storage);

                            const colors = utils.getColors();

                            const newQuiz = new Quiz({
                                quizID: uid,
                                name: quizDetails.name,
                                shuffle: quizDetails.shuffle,
                                owner: storage.user,
                                playlistOwner: quizDetails.playlistOwner,
                                nbrOfSongs: quizDetails.nbrOfSongs,
                                availableColors: colors.splice(1, colors.length),
                                started: false,
                                finished: false,
                                playlist: {
                                    id: quizDetails.playlistID,
                                    name: quizDetails.playlistName,
                                    owner: quizDetails.playlistOwner,
                                    generated: quizDetails.generated,
                                },
                                players: [{
                                    userID: storage.user,
                                    answers: utils.initArr(quizDetails.nbrOfSongs),
                                    points: 0,
                                    color: colors[0],
                                    spotify: true
                                }]
                            });
                            newQuiz.questions = result;
                            newQuiz.save(function (err) {
                                if (err) {
                                    console.log('error when saving quiz!', err);
                                }
                            });
                            socket.emit('createQuizCallback', newQuiz);
                        }).catch((err) => {
                            socket.emit('createQuizCallback', {error: 'Could not create quiz. Try reducing the number of questions'});
                        });
                    }
                });
            });

            socket.on('joinQuiz', function (data) {
                console.log("in joinQuiz", data);
                const room = data.room;
                sessionStore.load(session_id, function (err, storage) {
                    // The user joins a room
                    Quiz.findOne({'quizID': room}, function (err, quiz) {
                        if (err || !quiz) {
                            socket.emit('joinQuizCallback', {error: {invalid: 'Invalid Quiz code!'}});
                        } else {
                            if (quiz.started === false && quiz.finished === false) {
                                if(!storage.spotifyAuthed) {
                                    for(let i = 0; i < quiz.players.length; i++) {
                                        if(quiz.players[i].userID === data.username) {
                                            return socket.emit('joinQuizCallback', {error: {nameExists: 'Username already taken!'}});
                                        }
                                    }
                                    storage.user = data.username;
                                    storage.spotifyAuthed = false;
                                }
                                // Join the room
                                socket.join(room);
                                storage.quizID = room;
                                sessionStore.set(session_id, storage);

                                const userColor = quiz.availableColors[0];
                                quiz.availableColors = quiz.availableColors.splice(1, quiz.availableColors.length);
                                const player = {
                                    userID: storage.user,
                                    color: userColor,
                                    spotify: storage.spotifyAuthed,
                                    answers: utils.initArr(quiz.nbrOfSongs),
                                    points: 0
                                };
                                quiz.players.push(player);

                                // Emit result back to client
                                socket.emit('joinQuizCallback', quiz);

                                // Emit to room that user with name joined
                                io.to(room).emit('userJoined', player);

                                quiz.save(function (err) {
                                    if (err) {
                                        console.log('error when saving quiz!', err);
                                    }
                                });

                            } else {
                                if(quiz.started === true) {
                                    socket.emit('joinQuizCallback', {error: {invalid: 'Quiz already started!'}});
                                } else {
                                    socket.emit('joinQuizCallback', {error: {invalid: 'Invalid Quiz code!'}});
                                }
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
                                    quiz.save(function (err) {
                                        if (err) {
                                            console.log('error in nextQuestion', err);
                                        }
                                        io.to(storage.quizID).emit('quizStart');
                                        utils.countDown(25, io, storage.quizID);
                                    });
                                } else {
                                    quiz.questionIndex++;
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

            socket.on('getUser', function (userId) {
                console.log('in getUser', userId);
                sessionStore.load(session_id, function (err, storage) {
                    if(userId === storage.user) {
                        socket.emit('getUserCallback', userId);
                    } else {
                        socket.emit('getUserCallback', {error: 'No such user!'});
                    }
                })
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
                    Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
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
                    if(storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, 'players', function (err, quiz) {
                            for(let i = 0; i < quiz.players.length; i++) {
                                if(quiz.players[i].userID === storage.user) {
                                    quiz.players.splice(i, 1);
                                    break;
                                }
                            }

                            quiz.save(function(err) {
                                if(err) {
                                    console.log('error when saving', err);
                                }
                            });
                        });
                        io.to(storage.quizID).emit('userLeft', storage.user);
                        delete storage.quizID;
                        sessionStore.set(session_id, storage);
                    }
                });
            });

            socket.on('logout', function () {
                console.log("in logout");
                sessionStore.load(session_id, function (err, storage) {
                    if(storage.quizID) {
                        io.to(storage.quizID).emit('userLeft', storage.user);
                        delete storage.quizID;
                    }
                    if(storage.user) {
                        delete storage.user;
                    }
                    if(storage.tokens) {
                        delete storage.tokens;
                    }
                    if(storage.spotifyAuthed) {
                        delete storage.spotifyAuthed;
                    }
                    sessionStore.set(session_id, storage);
                });
            });

            socket.on('disconnect', function () {
                console.log("Client disconnected");
                // TODO Some work needs to be done here. How to differ between a refresh and a leave?
                // TODO Want to do stuff if user is not reconnected in like 5 seconds
                sessionStore.load(session_id, function (err, storage) {
                    if(storage.quizID) {
                        io.to(storage.quizID).emit('userLeft', storage.user);
                    }
                });
            });
        }
    });
};