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
        var user = {};

        socket.onmessage = function(event){
            console.log(event);
            var data = angular.fromJson(event.data);
            if (angular.isDefined(callbacks[data.request_id])) {
                var callback = callbacks[data.request_id];
                delete callbacks[data.request_id];
                callback.resolve(data);
            } else {
                console.error("Unhandled message: %o", data);
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

        socket.onopen = function (event) {
            isReady = true;
            $rootScope.$broadcast('service-ready');
            console.log("Service ready");

            if (sessionStorage.user){
                // User in storage
                user = angular.fromJson(sessionStorage.user);
                var data = {
                    uuid: user.uuid
                };
                invoke("setUser", data).then(function(success){
                    if (!success)
                        sessionStorage.user = "";
                });
            }
        };

        return {

            isReady: function(){
                return isReady;
            },

            isLoggedIn: function(){
                return ("id" in user);
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

            createQuiz: function(){
                invoke("createQuiz", {}).then(function(userData){
                    //user = userData;
                    //sessionStorage.user = angular.toJson(user);
                    //callback(user);
                });
            },

            // callback(user)
            getUser: function(callback){
                if (this.isLoggedIn())
                    // No user in storage
                    callback(user);
                else
                    callback({});
            },

            // callback(url)
            getLoginUrl: function(callback) {
                invoke("getLoginURL").then(callback);
            },

            logout: function(){
                sessionStorage.user = "";
                user = {};
                invoke("logout");
            },

            // callback(users)
            getUsers: function(callback){
                invoke("getUsers").then(callback);
            },

            // callback(lists)
            getPlaylists: function(callback){
                invoke("getPlaylists").then(callback);
            }

        };
    }]);