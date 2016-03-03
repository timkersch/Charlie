'use strict';

var charlieApp = angular.module('charlieApp', [
	'ngRoute',
    'ngMaterial',
	'signupService'
]);

charlieApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
        when('/', {
			templateUrl: 'index.html',
			controller: 'exempelController' 	
		}).
        when('/signup', {
            templateUrl: '/partials/signupview.html',
            controller: 'signupController'
        }).
        otherwise({
            redirectTo: '/index.html'
        });
	}]);