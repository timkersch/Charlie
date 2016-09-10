/**
 * Created by Tim on 03/09/16.
 */

'use strict';

const charlieService = angular.module('charlieService', []);

charlieService.factory('charlieProxy', ['$rootScope',
    function ($rootScope) {
        const socket = io.connect();
        let isReady = false;
        let readyCallbacks = [];
        let user = '';
        let currentQuiz;

        socket.on('connect', function(){
            console.log('socketio open!');
            if (sessionStorage.getItem('user')) {
                // User in storage
                user = sessionStorage.getItem('user');
                // Get the user data
                socket.emit('setUser', user.id);
                socket.on('setUserCallback', function(data) {
                    // If we got no such user
                    if(!data) {
                        sessionStorage.user = "";
                        setReady();
                    // Found user
                    } else {
                        // Get the users quiz
                        socket.emit('getQuiz');
                        socket.on('getQuizCallback', function(quiz) {
                            currentQuiz = quiz;
                            setReady();
                        });
                    }
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
                if (!isReady)
                    readyCallbacks.push(callback);
                else
                    callback();
            },

            /**
             * Users
             */

            // callback(url)
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
                    $rootScope.$apply();
                });
            },

            logout: function () {
                socket.emit('logout');
                user = undefined;
                currentQuiz = undefined;
                sessionStorage.clear();
            },

            // callback(user)
            getUser: function (callback) {
                if (this.isLoggedIn())
                    callback(user);
                else
                    callback();
            },

            /**
             * Quiz
             */

            // callback(quiz)
            createQuiz: function (name, playlistId, owner, nbrOfSongs, generated, callback) {
                let data = {
                    name: name,
                    playlist: playlistId,
                    nbrOfSongs: parseInt(nbrOfSongs),
                    generated: generated,
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

            // callback(lists)
            getPlaylists: function (callback) {
                socket.emit('getPlaylists');
                socket.on('getPlaylistsCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            // callback(isCorrect)
            answerQuestion: function (artistName) {
                socket.emit('answerQuestion', artistName);
            },

            // callback(question)
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

            // callback(started)
            isQuizStarted: function (callback) {
                socket.emit('isQuizStarted');
                socket.on('isQuizStartedCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            // callback(success)
            joinQuiz: function (data, callback) {
                socket.emit('joinQuiz', data);
                socket.on('joinQuizCallback', function(quiz) {
                    if (quiz && !quiz.error) {
                        currentQuiz = quiz;
                        callback(quiz);
                    } else {
                        callback(quiz);
                    }
                    $rootScope.$apply();
                });
            },

            leaveQuiz: function () {
                socket.emit('leaveQuiz');
            },

            // callback(question)
            nextQuestion: function () {
                socket.emit('nextQuestion');
            },

            savePlaylist: function () {
                socket.emit('savePlaylist');
            },

            // callback(users)
            getResults: function (callback) {
                socket.emit('getResults');
                socket.on('getResultsCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            // callback(quiz)
            getQuiz: function (callback) {
                if (currentQuiz) {
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
                    $rootScope.$apply();
                });
            },

            gameOver : function(callback) {
                socket.on('gameOver', function() {
                    callback();
                    $rootScope.$apply();
                });
            },

            newQuestion : function(callback) {
                socket.on('newQuestion', function(data) {;
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
    }]);