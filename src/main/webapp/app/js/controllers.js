'use strict';

var charlieController = angular.module('charlieController', [
    'charlieService',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$route', '$routeParams', 'charlieProxy',
    function($scope, $route, $routeParams, charlieProxy){
        $scope.$route = $route;
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

charlieController.controller('sidenavController', [ '$scope', '$routeParams', 'charlieProxy', '$mdSidenav',
    function($scope, $routeParams, charlieProxy, $mdSidenav) {
        $scope.toggleLeftMenu = function() {
            $mdSidenav('left').toggle();
        };

        $scope.isLoggedIn = false;

        $scope.url = "";

        $scope.$on('service-ready', function(event, args) {
            console.log("Service ready");
            charlieProxy.invoke("getLoginURL").then(function(response){
                console.log("response: ", response);
                if (response.data) {
                    $scope.url = response.data;
                }
            });
        });

        $scope.login = function (){
            console.log("login");
            window.location = $scope.url;
        };

        $scope.logout = function (){
            console.log("logout");

        };

    }]);

charlieController.controller('lobbyController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("hejaheja");
    }]);

charlieController.controller('questionController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("HejH");

    }]);

charlieController.controller('scoreboardController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("HejH");
    }]);