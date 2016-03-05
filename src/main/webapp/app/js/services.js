'use strict';

var charlieService = angular.module('charlieService', []);


charlieService.factory('charlieProxy', ['$q', '$rootScope',
    function($q, $rootScope){
        var socket = new WebSocket("ws://localhost:8080/actions");
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

        socket.onopen = function (event) {
            isReady = true;
            $rootScope.$broadcast('service-ready');
            console.log("Service ready");
        };

        return {
            postAnswer: function(){
                console.log("Posting...");
                var message = {
                    action: "action",
                    name: "name",
                    type: "type",
                    description: "description"
                };
                socket.send(JSON.stringify(message));
            },

            isReady: function(){
                return isReady;
            },

            login: function(){
                console.log("Posting...");
                var message = {
                    action: "login",
                    id: "3333"
                };
                socket.send(JSON.stringify(message));
            },

            logout: function(){
                console.log("Posting...");
                var message = {
                    action: "logout"
                };
                socket.send(JSON.stringify(message));
            },

            invoke: function(name, data) {
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
            },

            getUser: function(id, callback){
                return user;
            }

        };
    }]);