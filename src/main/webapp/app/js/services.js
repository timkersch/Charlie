'use strict';

var charlieService = angular.module('charlieService', []);


charlieService.factory('charlieProxy', ['$rootScope',
    function ($rootScope) {
        var socket = new WebSocket("ws://localhost:8080/Charlie/api");

        var requestId = 0;
        var getRequestId = function () {
            return requestId++;
        };
        var isReady = false;
        var callbacks = {};
        var listenCallbacks = {};
        var readyCallbacks = [];
        var user = {};
        var currentQuiz;

        socket.onmessage = function (event) {
            ;
            var response = angular.fromJson(event.data);
            if (angular.isDefined(callbacks[response.request_id])) {
                var callback = callbacks[response.request_id];
                delete callbacks[response.request_id];
                try {
                    response.data = JSON.parse(response.data);
                } catch (error) {
                }
                console.log("Invoke(" + response.action + "), response: ", response.data);
                callback(response.data);
                $rootScope.$apply();
            } else {
                console.log("ListenEvent(%o)", response.action);
                var action = response.action;
                var data = response.data;
                try {
                    data = JSON.parse(data);
                } catch (error) {
                }
                if (Array.isArray(listenCallbacks[action])) {
                    for (var i = 0; i < listenCallbacks[action].length; i++) {
                        listenCallbacks[action][i](data);
                    }
                }
            }
        };

        var invoke = function (name, data, callback) {
            console.log("Invoke(" + name + "), data: " + JSON.stringify(data));
            var request = {
                action: name,
                request_id: getRequestId(),
                data: data
            };
            callbacks[request.request_id] = callback;
            socket.send(angular.toJson(request));
        };

        var setReady = function () {
            console.log("service-ready");
            isReady = true;
            for (var i = 0; i < readyCallbacks.length; i++) {
                readyCallbacks[i]();
            }
            readyCallbacks = [];
            $rootScope.$broadcast('service-ready');
        };

        socket.onopen = function (event) {
            if (sessionStorage.user) {
                // User in storage
                user = angular.fromJson(sessionStorage.user);
                var data = {
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
                return ("name" in user);
            },
            login: function (code, callback) {
                var data = {
                    code: code
                };
                invoke("login", data, function (userData) {
                    user = userData;
                    sessionStorage.user = angular.toJson(user);
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
                var data = {
                    name: name,
                    users: userIds,
                    playlist: playlistId,
                    playlistOwner: playlistOwner,
                    nbrOfSongs: nbrOfSongs,
                    generated: generated
                };
                invoke("createQuiz", data, function (quiz) {
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
                var data = {
                    artistName: artistName
                };
                invoke('answerQuestion', data, callback);
            },
            // callback(question)
            getCurrentQuestion: function (callback) {
                invoke('getCurrentQuestion', {}, callback);
            },
            isQuizOwner: function () {
                return currentQuiz.owner.name === user.name;
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
                var data = {
                    quizId: quiz.uuid
                };
                invoke('joinQuiz', data, function (success) {
                    if (success)
                        currentQuiz = quiz;
                    callback(success);
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