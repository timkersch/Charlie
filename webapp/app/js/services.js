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
                });
            },

            /**
             * Quiz
             */

            // callback(quiz)
            createQuiz: function (name, userIds, playlistId, playlistOwner, nbrOfSongs, generated, callback) {
                let data = {
                    name: name,
                    users: userIds,
                    playlist: playlistId,
                    playlistOwner: playlistOwner,
                    nbrOfSongs: nbrOfSongs,
                    generated: generated
                };
                socket.emit('createQuiz', data);
                socket.on('createQuizCallback', function(quiz) {
                    currentQuiz = quiz;
                    callback(currentQuiz);
                });
            },

            // callback(lists)
            getPlaylists: function (callback) {
                socket.emit('getPlaylists', {});
                socket.on('getPlaylistsCallback', function(data) {
                    callback(data);
                });
            },

            // callback(isCorrect)
            answerQuestion: function (artistName, callback) {
                let data = {
                    artistName: artistName
                };
                socket.emit('answerQuestion', data);
                socket.on('answerQuestionCallback', function(data) {
                   callback(data);
                });
            },

            // callback(question)
            getCurrentQuestion: function (callback) {
                socket.emit('getCurrentQuestion', {});
                socket.on('getCurrentQuestionCallback', function(data) {
                    callback(data);
                });
            },

            isQuizOwner: function () {
                return currentQuiz.owner === user.id;
            },

            // callback(started)
            isQuizStarted: function (callback) {
                socket.emit('isQuizStarted', {});
                socket.on('isQuizStartedCallback', function(data) {
                    callback(data);
                });
            },

            // callback(users)
            getUsersInQuiz: function (callback) {
                socket.emit('getUsersInQuiz', {});
                socket.on('getUsersInQuizCallback', function(data) {
                    callback(data);
                });
            },

            // callback(success)
            joinQuiz: function (quiz, callback) {
                let data = {
                    id: quiz
                };
                socket.emit('joinQuiz', data);
                socket.on('joinQuizCallback', function(result) {
                    if (result.quiz) {
                        currentQuiz = result.quiz;
                        callback(result.quiz);
                    } else {
                        callback();
                    }
                });
            },

            // callback(question)
            nextQuestion: function (callback) {
                socket.emit('nextQuestion', {});
                socket.on('nextQuestionCallback', function(data) {
                    callback(data);
                });
            },

            savePlaylist: function () {
                socket.emit('savePlaylist', {});
            },

            // callback(users)
            getResults: function (callback) {
                socket.emit('getResults', {});
                socket.on('getResultsCallback', function(data) {
                   callback(data);
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
                    });
                }
            },

            getNumberOfQuestions: function () {
                return !currentQuiz ? 0 : currentQuiz.questions.length;
            },

            userJoined : function(callback) {
                socket.on('userJoined', function(msg) {
                    callback(msg.user);
                });
            },

            quizStart : function(callback) {
                socket.on('quizStart', function(data) {
                    callback(data);
                });
            },

            gameOver : function(callback) {
                socket.on('gameOver', function(data) {
                    callback(data);
                });
            },

            newQuestion : function(callback) {
                socket.on('newQuestion', function(data) {
                    callback(data);
                });
            },

            userPointsUpdate : function(callback) {
                socket.on('userPointsUpdate', function(data) {
                    callback(data);
                });
            }

        };
    }]);