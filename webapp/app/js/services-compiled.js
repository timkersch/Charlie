'use strict';

var charlieService = angular.module('charlieService', []);

charlieService.factory('charlieProxy', ['$rootScope', function ($rootScope) {
    var socket = io('ws://localhost:8080/');

    var requestId = 0;
    var getRequestId = function getRequestId() {
        return requestId++;
    };
    var _isReady = false;
    var callbacks = {};
    var listenCallbacks = {};
    var readyCallbacks = [];
    var user = {};
    var currentQuiz = void 0;

    socket.on('connect', function () {
        console.log("socketio open!");
        if (sessionStorage.user) {
            // User in storage
            user = sessionStorage.user;
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
    });

    socket.on('disconnect', function () {
        console.log("socketio close!");
    });

    socket.on('callback', function (event) {
        console.log("Callback event(%o)", event);
        var action = event.action;
        var data = event.data;
        var id = event.request_id;
        var callback = callbacks[id];
        delete callbacks[id];
        callback(data);
        $rootScope.$apply();
    });

    socket.on('listen', function (event) {
        console.log("ListenEvent(%o)", event);
        var action = event.action;
        var data = event.data;
        if (Array.isArray(listenCallbacks[action])) {
            for (var i = 0; i < listenCallbacks[action].length; i++) {
                listenCallbacks[action][i](data);
            }
        }
    });

    var invoke = function invoke(name, data, callback) {
        console.log("Invoke(" + name + "), data: " + JSON.stringify(data));
        var request = {
            request_id: getRequestId(),
            data: data
        };
        callbacks[request.request_id] = callback;
        socket.emit(name, request);
    };

    var setReady = function setReady() {
        console.log("service-ready");
        _isReady = true;
        for (var i = 0; i < readyCallbacks.length; i++) {
            readyCallbacks[i]();
        }
        readyCallbacks = [];
        $rootScope.$broadcast('service-ready');
    };

    return {
        call: function call(method, data, callback) {
            invoke(method, data, callback);
        },
        /**
         * Service
         */

        isReady: function isReady() {
            return _isReady;
        },
        onReady: function onReady(callback) {
            if (!_isReady) readyCallbacks.push(callback);else callback();
        },
        /**
         * User
         */

        // callback(url)
        getLoginUrl: function getLoginUrl(callback) {
            invoke("getLoginURL", {}, callback);
        },
        isLoggedIn: function isLoggedIn() {
            return 'name' in user;
        },
        login: function login(code, callback) {
            var data = {
                code: code
            };
            invoke("login", data, function (userData) {
                user.name = userData;
                sessionStorage.user = user;
                callback(user);
            });
        },
        logout: function logout() {
            sessionStorage.user = "";
            user = {};
            invoke("logout");
        },
        // callback(user)
        getUser: function getUser(callback) {
            if (this.isLoggedIn())
                // No user in storage
                callback(user);else callback({});
        },
        // callback(users)
        getUsers: function getUsers(callback) {
            invoke("getUsers", {}, callback);
        },
        /**
         * Quiz
         */

        // callback(quiz)
        createQuiz: function createQuiz(name, userIds, playlistId, playlistOwner, nbrOfSongs, generated, callback) {
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
        getPlaylists: function getPlaylists(callback) {
            invoke("getPlaylists", {}, callback);
        },
        // callback(isCorrect)
        answerQuestion: function answerQuestion(artistName, callback) {
            var data = {
                artistName: artistName
            };
            invoke('answerQuestion', data, callback);
        },
        // callback(question)
        getCurrentQuestion: function getCurrentQuestion(callback) {
            invoke('getCurrentQuestion', {}, callback);
        },
        isQuizOwner: function isQuizOwner() {
            return currentQuiz.owner.name === user.name;
        },
        // callback(started)
        isQuizStarted: function isQuizStarted(callback) {
            invoke("isQuizStarted", {}, callback);
        },
        // callback(users)
        getUsersInQuiz: function getUsersInQuiz(callback) {
            invoke('getUsersInQuiz', {}, callback);
        },
        // callback(success)
        joinQuiz: function joinQuiz(quiz, callback) {
            var data = {
                quizId: quiz.uuid
            };
            invoke('joinQuiz', data, function (success) {
                if (success) currentQuiz = quiz;
                callback(success);
            });
        },
        // callback(question)
        nextQuestion: function nextQuestion(callback) {
            invoke('nextQuestion', {}, callback);
        },
        savePlaylist: function savePlaylist() {
            invoke('savePlaylist');
        },
        // callback(users)
        getResults: function getResults(callback) {
            invoke('getResults', {}, callback);
        },
        // callback(quiz)
        getQuiz: function getQuiz(callback) {
            if (currentQuiz) callback(currentQuiz);else invoke("getQuiz", {}, function (quiz) {
                currentQuiz = quiz;
                callback(quiz);
            });
        },
        getNumberOfQuestions: function getNumberOfQuestions() {
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
        listenTo: function listenTo(action, callback) {
            console.log("listenTo(" + action + ")");
            if (!Array.isArray(listenCallbacks[action])) listenCallbacks[action] = [];
            listenCallbacks[action].push(callback);
        }
    };
}]);

//# sourceMappingURL=services-compiled.js.map