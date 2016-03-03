'use strict';

var charlieController = angular.module('charlieController', [
    'charlieService'
]);

charlieController.controller('mainController', ['$scope', '$route', '$routeParams', 'charlieProxy',
    function($scope, $route, $routeParams, charlieProxy){
        $scope.$route = $route;
    }]);

charlieController.controller('signupController'[ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {

    }]);

charlieController.controller('lobbyController'[ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("hejaheja");
    }]);

charlieController.controller('questionController'[ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {

    }]);

charlieController.controller('scoreboardController'[ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {

    }]);