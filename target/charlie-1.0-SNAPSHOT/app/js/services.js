'use strict';

var charlieService = angular.module('charlieService', []);


charlieService.factory('charlieProxy', ['$http',
    function($http){
        var socket = new WebSocket("ws://localhost:8080/actions");
        socket.onmessage = function(event){
            console.log(event);
        };

        return {
            postAnswer: function(answer){
                console.log("Posting...");
                socket.send(answer);
            },

            getUser: function(id, callback){
                //socket.invoke("getUser", id).success(callback);
            }

        };
    }]);