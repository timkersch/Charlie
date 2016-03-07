'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$location', '$routeParams', 'charlieProxy', '$mdSidenav',
    function($scope, $location, $routeParams, charlieProxy, $mdSidenav) {
        $scope.user = {};
        $scope.url = "";

        $scope.changeView = function(view){
            console.log("Changing view to: " + view);
            $location.path(view); // path not hash
            $scope.toggleLeftMenu();
        };

        $scope.toggleLeftMenu = function() {
            $mdSidenav('left').toggle();
        };

        var init = function(){
            if (charlieProxy.isLoggedIn()) {
                console.log("Not logged in");
                charlieProxy.getUser(function(user){
                   $scope.user = user;
                });
            } else {
                if ($routeParams.code){
                    charlieProxy.login($routeParams.code, function(user){
                        $scope.user = user;
                    });
                } else {
                    charlieProxy.getLoginUrl(function(url){
                        $scope.url = url;
                    });
                }
            }
        };

        $scope.$on('$routeChangeSuccess', function() {
            // Initialize when service is ready
            if (charlieProxy.isReady()){
                console.log("Already done");
                init();
            }else{
                $scope.$on('service-ready', function(event, args) {
                    init();
                });
            }
        });

        $scope.login = function (){
            console.log("login");
            window.location.href = $scope.url;
        };

        $scope.logout = function (){
            console.log("logout");
            $scope.user = {};
            charlieProxy.logout();
            charlieProxy.getLoginUrl(function(url){
                $scope.url = url;
            });
        };
    }]);

charlieController.controller('lobbyController', ['$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy){
        console.log("LobbyController!");
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

charlieController.controller('homeController', [ '$scope', '$routeParams', 'charlieProxy',
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

charlieController.controller('questionController', [ '$scope', '$routeParams', '$interval', 'charlieProxy',
    function($scope, $routeParams, $interval, charlieProxy) {
        console.log("Inside questionController");
        $scope.determinateValue = 10;
        var incrementer = 0;
        $scope.activated = true;
        $interval(function(){
            incrementer += 1;
            if(incrementer > 9){
                incrementer = 0;
                $scope.determinateValue -= 1;
                if($scope.determinateValue === -1){
                    /*Call a new question from here, because the time has passed*/
                    $scope.determinateValue = 10;
                }
            }
        }, 100, 0, true);

    }]);

charlieController.controller('scoreboardController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside scoreboardController");


    }]);

charlieController.controller('profileController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside profileController");
    }]);

charlieController.controller('createController', ['$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside createController");
        $scope.playlistSelected = 0;
        $scope.readonly = false;
        $scope.tags = [];


        charlieProxy.getPlaylists(function(lists){
            $scope.playlists = lists
        });

    }]);