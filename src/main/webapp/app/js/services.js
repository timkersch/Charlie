'use strict';

var charlieService = angular.module('charlieService', []);


charlieService.factory('charlieProxy', ['$q', '$rootScope',
    function($q, $rootScope){
        var socket = new WebSocket("ws://localhost:8080/SpotHoot/api");

        var requestId = 0;
        var getRequestId = function(){
            return requestId++;
        };
        var isReady = false;
        var callbacks = {};
        var listenCallbacks = {};
        var user = {};
        var currentQuiz;

        socket.onmessage = function(event){
            console.log(event);
            var response = angular.fromJson(event.data);
            if (angular.isDefined(callbacks[response.request_id])) {
                var callback = callbacks[response.request_id];
                delete callbacks[response.request_id];
                callback.resolve(response);
            } else {
                console.log("ListenEvent(%o)", response.action);
                var action = response.action;
                var data = response.data;
                try {
                    data = JSON.parse(data);
                } catch(error) {}
                if (Array.isArray(listenCallbacks[action])) {
                    for (var i = 0; i < listenCallbacks[action].length; i++) {
                        listenCallbacks[action][i](data);
                    }
                }
            }
        };

        var invoke = function(name, data) {
            console.log("Invoke(" + name + "), data: " + JSON.stringify(data));
            var request = {
                action: name,
                request_id: getRequestId(),
                data: data
            };
            var deferred = $q.defer();
            callbacks[request.request_id] = deferred;
            socket.send(angular.toJson(request));
            return deferred.promise.then(function(response) {
                console.log("Invoke(" + name + "), response: ", response);
                request.response = response;
                try {
                    response.data = JSON.parse(response.data);
                } catch(error) {}
                return response.data;
            });
        };
        
        var setReady = function(){
            console.log("service-ready");
            isReady = true;
            $rootScope.$broadcast('service-ready');
        };

        socket.onopen = function (event) {
            if (sessionStorage.user){
                // User in storage
                user = angular.fromJson(sessionStorage.user);
                var data = {
                    id: user.id
                };
                invoke("setUser", data).then(function(success){
                    if (!success) {
                        sessionStorage.user = "";
                        setReady();
                    }else{
                        invoke("getQuiz").then(function(quiz){
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

            /**
             * Service
             */
            
            isReady: function(){
                return isReady;
            },
            
            /**
             * User
             */

            // callback(url)
            getLoginUrl: function(callback) {
                invoke("getLoginURL").then(callback);
            },

            isLoggedIn: function(){
                return ("name" in user);
            },

            login: function(code, callback){
                var data = {
                    code: code
                };
                invoke("login", data).then(function(userData){
                    user = userData;
                    sessionStorage.user = angular.toJson(user);
                    callback(user);
                });
            },

            logout: function(){
                sessionStorage.user = "";
                user = {};
                invoke("logout");
            },

            // callback(user)
            getUser: function(callback){
                if (this.isLoggedIn())
                    // No user in storage
                    callback(user);
                else
                    callback({});
            },

            // callback(users)
            getUsers: function(callback){
                invoke("getUsers").then(callback);
            },
            
            /**
             * Quiz
             */

            // callback(quiz)
            createQuiz: function(name, userIds, playlistId, playlistOwner, nbrOfSongs, generated, callback){
                var data = {
                    name: name,
                    users: userIds,
                    playlist: playlistId,
                    playlistOwner: playlistOwner,
                    nbrOfSongs: nbrOfSongs,
                    generated: generated
                };
                invoke("createQuiz", data).then(function(quiz){
                    currentQuiz = quiz;
                    callback(currentQuiz);
                });
            },

            // callback(lists)
            getPlaylists: function(callback){
                invoke("getPlaylists").then(callback);
            },
            
            // callback(isCorrect)
            answerQuestion: function(artistName, callback){
                var data = {
                    artistName: artistName,
                };
                invoke('answerQuestion', data).then(callback);
            },
            
            // callback(question)
            getCurrentQuestion: function(callback) {
                invoke('getCurrentQuestion').then(callback);
            },
            
            isQuizOwner: function() {
                return currentQuiz.owner.name === user.name;
            },
            
            // callback(started)
            isQuizStarted: function(callback){
                invoke("isQuizStarted").then(callback);
            },
            
            // callback(users)
            getUsersInQuiz: function(callback){
                invoke('getUsersInQuiz').then(callback);
            },
            
            // callback(success)
            joinQuiz: function(quiz, callback) {
                var data = {
                    quizId: quiz.uuid
                };
                invoke('joinQuiz', data).then(function(success){
                    if (success)
                        currentQuiz = quiz;
                    callback(success);
                });
            },

            // callback(question)
            nextQuestion: function(callback) {
                invoke('nextQuestion').then(callback);
            },

            savePlaylist: function() {
                invoke('savePlaylist');
            },
            
            // callback(users)
            getResults: function(callback){
                invoke('getResults').then(callback);
            },

            // callback(quiz)
            getQuiz: function(callback) {
                if (currentQuiz)
                    callback(currentQuiz);
                else
                    invoke("getQuiz").then(function(quiz){
                        currentQuiz = quiz;
                        callback(quiz);
                    });
            },
            
            /* action: 
             *      userJoined      --> callback(newUser)
             *      invitedTo       --> callback(quiz)
             *      newQuestion     --> callback(question)
             *      gameOver        --> callback(players)
             *      quizStart       --> callback()
             */
            listenTo: function(action, callback){
                console.log("listenTo(" + action + ")");
                if (!Array.isArray(listenCallbacks[action]))
                    listenCallbacks[action] = [];
                listenCallbacks[action].push(callback);
            }
        };
    }]);