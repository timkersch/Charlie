'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$routeParams', 'charlieProxy', '$mdSidenav',
    function($scope, $routeParams, charlieProxy, $mdSidenav) {
        $scope.toggleLeftMenu = function() {
            $mdSidenav('left').toggle();
        };

        var init = function(){
            if (!sessionStorage.user) {
                if (!$routeParams.code) {
                    charlieProxy.invoke("getLoginURL").then(function (url) {
                        if (url) {
                            $scope.url = url;
                        }
                    });
                } else {
                    var data = {
                        code: $routeParams.code
                    };
                    charlieProxy.invoke("getUserByCode", data).then(function (user) {
                        if (user) {
                            $scope.user = user;
                            sessionStorage.user = angular.toJson(user);
                        }
                    });
                }
            } else {
                $scope.user = angular.fromJson(sessionStorage.user);
                console.log("old uuid:" + $scope.user.uuid);
                var data2 = {
                    uuid: $scope.user.uuid
                };
                charlieProxy.invoke("setUser", data2).then(function (success) {
                    console.log("Success: " + success);
                });
            }
        };

        $scope.$on('$routeChangeSuccess', function() {
            if (charlieProxy.isReady()){
                init();
            }else{
                $scope.$on('service-ready', function(event, args) {
                    init();
                });
            }
        });

        $scope.user = {};
        $scope.url = "";

        $scope.login = function (){
            console.log("login");
            window.location = $scope.url;
        };

        $scope.logout = function (){
            console.log("logout");
            sessionStorage.user = "";
            $scope.user = {};
            charlieProxy.invoke("getLoginURL").then(function (url) {
                if (url) {
                    $scope.url = url;
                }
            });
        };
    }]);

charlieController.controller('signupController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");

        $scope.publish = function () {
            console.log("Publish");
            charlieProxy.postAnswer();
        };

        $scope.create = function (){
            console.log("create");

        };

        $scope.register = function (){
            console.log("register");

        };
    }]);

charlieController.controller('lobbyController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");

        $scope.getPlaylists = function (){
            console.log("login");
            charlieProxy.invoke("getPlaylists").then(function(lists){
                console.log("Playlist[0] = " + lists[0]);
                if (lists) {
                    $scope.playlists = lists;
                }
            });
        };
    }]);

charlieController.controller('questionController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");

    }]);

charlieController.controller('scoreboardController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");
    }]);