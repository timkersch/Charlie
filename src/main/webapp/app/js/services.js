'use strict';

var charlieService = angular.module('charlieService', []);


charlieService.factory('charlieProxy', ['$http',
    function($http){
        /*var socket = new WebSocket("ws://localhost:8080/actions");
        socket.onmessage = function(event){
          if(event.message === ""){

          }
        };*/

        return {
           /* postAnswer: function(answer){
                socket.send(answer);
            },

            getUser: function(id, callback){
                socket.invoke("getUser", id).success(callback);
            }

                */
        };
    }]);