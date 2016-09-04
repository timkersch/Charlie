/**
 * Created by Tim on 03/09/16.
 */

'use strict';

const charlieService = angular.module('charlieService', []);

charlieService.factory('charlieProxy', ['$rootScope',
    function ($rootScope) {
        const socket = io();
        let isReady = false;
        let readyCallbacks = [];
        let user = '';
        let currentQuiz;

        socket.on('connect', function(){
            console.log('socketio open!');
            if (sessionStorage.getItem('user')) {
                // User in storage
                user = sessionStorage.getItem('user');
                setReady();
                // socket.emit('setUser', user.id);
                // socket.on('setUserCallback', function(data) {
                //     if(!data) {
                //         sessionStorage.user = "";
                //         setReady();
                //     } else {
                //         socket.emit('getQuiz', {});
                //         socket.on('getQuizCallback', function(quiz) {
                //             currentQuiz = quiz;
                //             setReady();
                //         });
                //     }
                // });
            } else {
                //sessionStorage.clear();
                setReady();
            }
        });

        socket.on('disconnect', function(){
            sessionStorage.setItem('user', user);
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
                    user = userData.id;
                    sessionStorage.setItem('user', userData.id);
                    callback(userData.id);
                    $rootScope.$apply();
                });
            },

            logout: function () {
                //sessionStorage.clear();
                user = {};
                socket.emit('logout', {});
            },

            // callback(user)
            getUser: function (callback) {
                if (this.isLoggedIn())
                    callback(user);
                else
                    callback();
            },

            // callback(users)
            getUsers: function (callback) {
                socket.emit('getUsers', {});
                socket.on('getUsersCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            /**
             * Quiz
             */

            // callback(quiz)
            createQuiz: function (name, playlistId, nbrOfSongs, generated, callback) {
                let data = {
                    name: name,
                    playlist: playlistId,
                    nbrOfSongs: nbrOfSongs,
                    generated: generated
                };
                socket.emit('createQuiz', data);
                socket.on('createQuizCallback', function(quiz) {
                    currentQuiz = quiz;
                    callback(currentQuiz);
                    $rootScope.$apply();
                });
            },

            // callback(lists)
            getPlaylists: function (callback) {
                socket.emit('getPlaylists', {});
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
                socket.emit('isQuizStarted', {});
                socket.on('isQuizStartedCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            // callback(users)
            getUsersInQuiz: function (callback) {
                socket.emit('getUsersInQuiz', {});
                socket.on('getUsersInQuizCallback', function(data) {
                    callback(data);
                    $rootScope.$apply();
                });
            },

            // callback(success)
            joinQuiz: function (quizID, callback) {
                socket.emit('joinQuiz', quizID);
                socket.on('joinQuizCallback', function(quiz) {
                    if (quiz) {
                        currentQuiz = quiz;
                        callback(true);
                        $rootScope.$apply();
                    } else {
                        callback(false);
                    }
                });
            },

            startQuiz : function () {
                socket.emit('startQuiz');
            },

            // callback(question)
            nextQuestion: function () {
                socket.emit('nextQuestion');
            },

            savePlaylist: function () {
                socket.emit('savePlaylist', {});
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
                    socket.emit('getQuiz', {});
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