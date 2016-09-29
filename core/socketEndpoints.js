'use strict';
/**
 * Created by Tim on 04/09/16.
 */

const utils = require('./helpers');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const spotify = require('./spotifyService.js');

module.exports = function(server, sessionStore, Quiz) {
    const io = require('socket.io')(server);

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
        if(error) {
            accept(new Error(message));
        }
    }

    io.on('connection', function (socket) {
        console.log('Client connected');

        if(socket.request.user.logged_in) {
            const user = socket.request.user;
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            const session_id = cookieParser.signedCookie(cookies['connect.sid'], process.env.COOKIE_SECRET);

            socket.on('createQuiz', function (quizDetails) {
                console.log("in createQuiz", quizDetails);

                sessionStore.load(session_id, function (err, storage) {
                    const api = new spotify.SpotifyApi(user.accessToken, user.refreshToken);
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
                            owner: user.userID,
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
                                userID: user.userID,
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
                });
            });

            socket.on('joinQuiz', function (data) {
                console.log("in joinQuiz", data);

                const room = data.room;
                sessionStore.load(session_id, function (err, storage) {
                    Quiz.findOne({'quizID': room}, function (err, quiz) {
                        if (err || !quiz) {
                            socket.emit('joinQuizCallback', {error: {invalid: 'Invalid Quiz code!'}});
                        } else {
                            if (!quiz.started && !quiz.finished) {
                                // Join the room
                                socket.join(room);
                                storage.quizID = room;
                                sessionStore.set(session_id, storage);

                                const userColor = quiz.availableColors[0];
                                quiz.availableColors = quiz.availableColors.splice(1, quiz.availableColors.length);
                                const player = {
                                    userID: user.userID,
                                    color: userColor,
                                    spotify: true,
                                    answers: utils.initArr(quiz.nbrOfSongs),
                                    points: 0
                                };
                                quiz.players.push(player);

                                socket.emit('joinQuizCallback', quiz);
                                io.to(room).emit('userJoined', player);

                                quiz.save(function (err) {
                                    if (err) {
                                        console.log('error when saving quiz!', err);
                                    }
                                });

                            } else {
                                if (quiz.started) {
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
                    if (user.userID && storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
                            if (user.userID === quiz.owner) {
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

            socket.on('answerQuestion', function (answer) {
                console.log("in answerQuestion", answer);

                sessionStore.load(session_id, function (err, storage) {
                    if (storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
                            quiz.players.forEach(function (player) {
                                if (player.userID === user.userID) {
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

            socket.on('leaveQuiz', function () {
                console.log("in leaveQuiz");
                sessionStore.load(session_id, function (err, storage) {
                    if (storage.quizID) {
                        Quiz.findOne({'quizID': storage.quizID}, 'players', function (err, quiz) {
                            for (let i = 0; i < quiz.players.length; i++) {
                                if (quiz.players[i].userID === user.userID) {
                                    quiz.players.splice(i, 1);
                                    break;
                                }
                            }

                            quiz.save(function (err) {
                                if (err) {
                                    console.log('error when saving', err);
                                }
                            });
                        });
                        io.to(storage.quizID).emit('userLeft', user.userID);
                        delete storage.quizID;
                        sessionStore.set(session_id, storage);
                    }
                });
            });

            socket.on('disconnect', function () {
                console.log("Client disconnected");
                // TODO Some work needs to be done here. How to differ between a refresh and a leave?
                // TODO Want to do stuff if user is not reconnected in like 5 seconds
                sessionStore.load(session_id, function (err, storage) {
                    if (storage.quizID) {
                        io.to(storage.quizID).emit('userLeft', user.userID);
                    }
                });
            });
        }
    });
};