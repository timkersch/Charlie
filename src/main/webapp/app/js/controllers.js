'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$location', '$routeParams', 'charlieProxy', '$mdSidenav',
    function($scope, $location, $routeParams, charlieProxy, $mdSidenav) {

        $scope.toggleLeftMenu = function() {
            $mdSidenav('left').toggle();
        };

        var getLoginURL = function() {
            charlieProxy.getLoginUrl(function(url){
                //window.location.href = url;
                $scope.url = url;
                console.log("URL:" + url);
            });
        };

        var getUser = function() {
            charlieProxy.loginWithCode($routeParams.code, function(user){
                $scope.user = user;
                sessionStorage.user = angular.toJson(user);
            });
        };

        var getUserFromStorage = function() {
            $scope.user = angular.fromJson(sessionStorage.user);
            charlieProxy.loginWithUser($scope.user.uuid, function(success){
                console.log("Success: " + success);
            });
        };

        var init = function(){
            if (!sessionStorage.user) {
                // No user in storage
                if (!$routeParams.code) // No redirect from spotify login
                    getLoginURL();
                    //setTimeout(getLoginURL, 2000);
                else
                    getUser();
            } else {
                // User in storage
                getUserFromStorage();
            }
        };

        $scope.$on('$routeChangeSuccess', function() {
            // Initialize when service is ready
            if (charlieProxy.isReady()){
                init();
            }else{
                $scope.$on('service-ready', function(event, args) {
                    init();
                });
            }


        });

        $scope.changeView = function(view){
            $location.path(view); // path not hash
            $scope.toggleLeftMenu();
        };

        $scope.user = {};
        $scope.url = "";

        $scope.login = function (){
            console.log("login");
            //getLoginURL();
            window.location.href = $scope.url;
        };

        $scope.logout = function (){
            console.log("logout");
            sessionStorage.user = "";
            $scope.user = {};
            charlieProxy.logout();
        };
    }]);

charlieController.controller('signupController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");

        $scope.publish = function () {
            console.log("Publish");
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
            charlieProxy.getPlaylists(function(lists){
                $scope.playlists = lists
            });
        };

        $scope.getUsers = function(){
            console.log("getUsers");
            charlieProxy.getUsers(function(users){
                $scope.users = users;
            });
        };
    }]);

charlieController.controller('questionController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside questionController");

    }]);

charlieController.controller('scoreboardController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside scoreboardController");
    }]);

charlieController.controller('createController', ['$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside createController");
        $scope.readonly = false;
        $scope.tags = [];

        $scope.showTags = function(){
            console.log($scope.tags);
        };

        charlieProxy.getPlaylists(function(lists){
            $scope.playlists = lists
        });

        $scope.choosePlaylist = function(id) {
            console.log(id);


        };
    }]);