'use strict';

var charlieController = angular.module('charlieController', [
    'charlieService'
]);

charlieController.controller('mainController', ['$scope', '$route', '$routeParams', 'charlieProxy',
    function($scope, $route, $routeParams, charlieProxy){
        $scope.$route = $route;
    }]);

charlieController.controller('signupController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");

        $scope.url = "hej";

        $scope.publish = function () {
            console.log("Publish");
            charlieProxy.postAnswer();
        };

        $scope.login = function (){
            console.log("login");
            charlieProxy.login();

        };

        charlieProxy.onMessage(function(event){
            var data = JSON.parse(event.data);
            if (data.url) {
                console.log(data.url);
                $scope.$apply(function () {
                    $scope.url = data.url;
                });
            }
        });

        $scope.logout = function (){
            console.log("logout");
            charlieProxy.logout();

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