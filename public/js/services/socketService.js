/**
 * Created by Tim on 03/09/16.
 */

const io = require('socket.io-client');

module.exports =
    function ($rootScope) {
        const socket = io();
        let isReady = false;
        let readyCallbacks = [];
        let user = '';
        let currentQuiz;

        socket.once('connect', function(){
            console.log('socketio open!');
            if (sessionStorage.getItem('user')) {
                // User in storage
                user = sessionStorage.getItem('user');
                // Get the user data
                socket.emit('getUser', user);
                socket.on('getUserCallback', function(data) {

                    if(!data || data.error) {
                        sessionStorage.clear();
                    } else {
                        // TODO Check current quiz and get relevant data
                    }
                    setReady();
                });
            } else {
                setReady();
            }
        });

        socket.on('disconnect', function(){
            sessionStorage.clear();
            console.log("socketio close!");
        });

        let setReady = function () {
            isReady = true;
            for (let i = 0; i < readyCallbacks.length; i++) {
                readyCallbacks[i]();
            }
            readyCallbacks = [];
            $rootScope.$broadcast('service-ready');
        };

        return {
            /**
             * Service
             */

            isReady: function () {
                return isReady;
            },
            onReady: function (callback) {
                if (!isReady) {
                    readyCallbacks.push(callback);
                }
                else {
                    callback();
                }
            },

            /**
             * Users
             */

            getLoginUrl: function (callback) {
                socket.emit('getLoginURL');
                socket.on('getLoginURLCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            isLoggedIn: function () {
                return (user !== null && user !== undefined && user !== '');
            },

            login: function (code, callback) {
                socket.emit('login', code);
                socket.on('loginCallback', function(userData) {
                    if(userData) {
                        user = userData.userID;
                        sessionStorage.setItem('user', userData.userID);
                        callback(userData.userID);
                    } else {
                        callback();
                    }
                    $rootScope.$broadcast('loggedIn', {});
                });
            },

            logout: function () {
                socket.emit('logout');
                user = undefined;
                currentQuiz = undefined;
                sessionStorage.clear();
            },

            getUser: function (callback) {
                if (this.isLoggedIn()) {
                    callback(user);
                } else {
                    callback();
                }
            },

            /**
             * Quiz
             */

            createQuiz: function (name, playlistId, playlistName, owner, nbrOfSongs, shuffle, callback) {
                let data = {
                    name: name,
                    playlistID: playlistId,
                    playlistName: playlistName,
                    nbrOfSongs: parseInt(nbrOfSongs),
                    shuffle: shuffle,
                    generated: false,
                    playlistOwner: owner
                };
                socket.emit('createQuiz', data);
                socket.on('createQuizCallback', function(quiz) {
                    if(!quiz || quiz.error) {
                        callback(quiz);
                    } else {
                        currentQuiz = quiz;
                        callback(currentQuiz);
                    }
                    $rootScope.$apply();
                });
            },

            getPlaylists: function (callback) {
                socket.emit('getPlaylists');
                socket.on('getPlaylistsCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            answerQuestion: function (artistName) {
                socket.emit('answerQuestion', artistName);
            },

            getCurrentQuestion: function (callback) {
                socket.emit('getCurrentQuestion');
                socket.on('getCurrentQuestionCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            isQuizOwner: function () {
                return currentQuiz.owner === user;
            },

            isQuizStarted: function (callback) {
                socket.emit('isQuizStarted');
                socket.on('isQuizStartedCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            joinQuiz: function (data, callback) {
                socket.emit('joinQuiz', data);
                socket.on('joinQuizCallback', function(quiz) {
                    if (quiz && !quiz.error) {
                        currentQuiz = quiz;
                        callback(quiz);
                    } else {
                        callback(quiz);
                    }
                });
            },

            userLeft: function(callback) {
                socket.on('userLeft', function(player) {
                    callback(player);
                    $rootScope.$apply();
                });
            },

            leaveQuiz: function () {
                socket.emit('leaveQuiz');
            },

            nextQuestion: function () {
                socket.emit('nextQuestion');
            },

            savePlaylist: function () {
                socket.emit('savePlaylist');
            },

            getResults: function (callback) {
                socket.emit('getResults');
                socket.on('getResultsCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            getQuiz: function (callback, forceGet) {
                if(!forceGet && currentQuiz) {
                    callback(currentQuiz);
                } else {
                    socket.emit('getQuiz');
                    socket.on('getQuizCallback', function (quiz) {
                        currentQuiz = quiz;
                        callback(quiz);
                        $rootScope.$apply();
                    });
                }
            },

            getNumberOfQuestions: function () {
                return !currentQuiz ? 0 : currentQuiz.nbrOfSongs;
            },

            /**
             * Listeners
             */

            timeLeft : function(callback) {
                socket.on('timeLeft', function(time) {
                    callback(time);
                    $rootScope.$apply();
                });
            },

            userJoined : function(callback) {
                socket.on('userJoined', function(user) {
                    callback(user);
                    $rootScope.$apply();
                });
            },

            quizStart : function(callback) {
                socket.on('quizStart', function(data) {
                    callback(data);
                });
            },

            gameOver : function(callback) {
                socket.on('gameOver', function() {
                    callback();
                    $rootScope.$apply();
                });
            },

            newQuestion : function(callback) {
                socket.on('newQuestion', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            userPointsUpdate : function(callback) {
                socket.on('userPointsUpdate', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            }

        };
    };