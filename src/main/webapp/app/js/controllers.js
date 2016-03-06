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

        var login = function() {
            charlieProxy.invoke("getLoginURL").then(function (url) {
                if (url) {
                    window.location.href = url;
                    //window.location.href = "http://www.google.se";
                }
            });
        };

        var getUser = function() {
            var data = {
                code: $routeParams.code
            };
            charlieProxy.invoke("getUserByCode", data).then(function (user) {
                if (user) {
                    $scope.user = user;
                    sessionStorage.user = angular.toJson(user);
                }
            });
        };

        var getUserFromStorage = function() {
            $scope.user = angular.fromJson(sessionStorage.user);
            var data2 = {
                uuid: $scope.user.uuid
            };
            charlieProxy.invoke("setUser", data2).then(function (success) {
                console.log("Success: " + success);
            });
        };

        var init = function(){
            if (!sessionStorage.user) {
                if (!$routeParams.code)
                    login();
                else
                    getUser();
            } else {
                getUserFromStorage();
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
            //login();
        };

        $scope.logout = function (){
            console.log("logout");
            sessionStorage.user = "";
            $scope.user = {};
            charlieProxy.invoke("logout");
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
                $scope.playlists = lists
            });
        };

        $scope.getUsers = function(){
            console.log("getUsers");
            charlieProxy.invoke("getUsers").then(function(users){
                $scope.users = users;
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