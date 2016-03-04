'use strict';

var charlieService = angular.module('charlieService', []);


charlieService.factory('charlieProxy', ['$http',
    function($http){
        var socket = new WebSocket("ws://localhost:8080/actions");

        socket.onmessage = function(event){
            console.log(event);
        };

        socket.onopen = function (event) {
            console.log(event);
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

            onMessage: function(callback){
                socket.onmessage = callback;
            },

            getUser: function(id, callback){
                //socket.invoke("getUser", id).success(callback);
            }

        };
    }]);