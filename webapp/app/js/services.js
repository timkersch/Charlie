'use strict';

const charlieService = angular.module('charlieService', []);

charlieService.factory('charlieProxy', ['$rootScope',
    function ($rootScope) {
        const socket = io();

        let requestId = 0;
        const getRequestId = function () {
            return requestId++;
        };
        let isReady = false;
        let callbacks = {};
        let listenCallbacks = {};
        let readyCallbacks = [];
        let user = {};
        let currentQuiz;

        socket.on('connect', function(){
            console.log("socketio open!");
            if (sessionStorage.user) {
                // User in storage
                user = sessionStorage.user;
                let data = {
                    id: user.id
                };
                invoke("setUser", data, function (success) {
                    if (!success) {
                        sessionStorage.user = "";
                        setReady();
                    } else {
                        invoke("getQuiz", {}, function (quiz) {
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
            console.log("socketio close!");
        });

        socket.on('callback', function (event) {
            console.log("Callback event(%o)", event);
            const action = event.action;
            const data = event.data;
            const id = event.request_id;
            const callback = callbacks[id];
            delete callbacks[id];
            console.log("got data", data);
            callback(data);
            $rootScope.$apply();
        });

        socket.on('listen', function (event) {
            console.log("ListenEvent(%o)", event);
            const action = event.action;
            const data = event.data;
            if (Array.isArray(listenCallbacks[action])) {
                for (let i = 0; i < listenCallbacks[action].length; i++) {
                    listenCallbacks[action][i](data);
                }
            }
        });

        let invoke = function (name, data, callback) {
            console.log("Invoke(" + name + "), data: " + JSON.stringify(data));
            let request = {
                request_id: getRequestId(),
                data: data
            };
            callbacks[request.request_id] = callback;
            socket.emit(name, request);
        };

        let setReady = function () {
            console.log("service-ready");
            isReady = true;
            for (let i = 0; i < readyCallbacks.length; i++) {
                readyCallbacks[i]();
            }
            readyCallbacks = [];
            $rootScope.$broadcast('service-ready');
        };

        return {
            call: function (method, data, callback) {
                invoke(method, data, callback);
            },
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
             * User
             */

            // callback(url)
            getLoginUrl: function (callback) {
                invoke("getLoginURL", {}, callback);
            },
            isLoggedIn: function () {
                return ('name' in user);
            },
            login: function (code, callback) {
                let data = {
                    code: code
                };
                invoke("login", data, function (userData) {
                    user.name = userData;
                    sessionStorage.user = user;
                    callback(user);
                });
            },
            logout: function () {
                sessionStorage.user = "";
                user = {};
                invoke("logout");
            },
            // callback(user)
            getUser: function (callback) {
                if (this.isLoggedIn())
                    // No user in storage
                    callback(user);
                else
                    callback({});
            },
            // callback(users)
            getUsers: function (callback) {
                invoke("getUsers", {}, callback);
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
                invoke("createQuiz", data, function (quiz) {
                    console.log('QUIZZER', quiz);
                    currentQuiz = quiz;
                    callback(currentQuiz);
                });
            },
            // callback(lists)
            getPlaylists: function (callback) {
                invoke("getPlaylists", {}, callback);
            },
            // callback(isCorrect)
            answerQuestion: function (artistName, callback) {
                let data = {
                    artistName: artistName
                };
                invoke('answerQuestion', data, callback);
            },
            // callback(question)
            getCurrentQuestion: function (callback) {
                invoke('getCurrentQuestion', {}, callback);
            },
            isQuizOwner: function () {
                return currentQuiz.owner === user.name;
            },
            // callback(started)
            isQuizStarted: function (callback) {
                invoke("isQuizStarted", {}, callback);
            },
            // callback(users)
            getUsersInQuiz: function (callback) {
                invoke('getUsersInQuiz', {}, callback);
            },
            // callback(success)
            joinQuiz: function (quiz, callback) {
                let data = {
                    id: quiz
                };
                invoke('joinQuiz', data, function (result) {
                    console.log(result);
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
                invoke('nextQuestion', {}, callback);
            },
            savePlaylist: function () {
                invoke('savePlaylist');
            },
            // callback(users)
            getResults: function (callback) {
                invoke('getResults', {}, callback);
            },
            // callback(quiz)
            getQuiz: function (callback) {
                if (currentQuiz)
                    callback(currentQuiz);
                else
                    invoke("getQuiz", {}, function (quiz) {
                        currentQuiz = quiz;
                        callback(quiz);
                    });
            },
            getNumberOfQuestions: function () {
                return !currentQuiz ? 0 : currentQuiz.questions.length;
            },

            userJoined : function(callback) {
                socket.on('userJoined', function(msg) {
                    callback(msg.user);
                });
            },

            /* action: 
             *      userJoined          --> callback(newUser)
             *      invitedTo           --> callback(quiz)
             *      newQuestion         --> callback(question)
             *      gameOver            --> callback(players)
             *      quizStart           --> callback()
             *      userPointsUpdate   --> callback(user)
             */
            listenTo: function (action, callback) {
                console.log("listenTo(" + action + ")");
                if (!Array.isArray(listenCallbacks[action]))
                    listenCallbacks[action] = [];
                listenCallbacks[action].push(callback);
            }
        };
    }]);