'use strict';

	var charlieApp = angular.module('charlieApp', [
		'ngRoute',
		'ngMaterial',
		'charlieController'
	]);

	charlieApp.config(['$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider){
			$routeProvider.
				when('/lobby', {
					templateUrl: 'app/partials/lobby.html',
					controller: 'lobbyController'
				}).
				when('/signup', {
					templateUrl: 'app/partials/signup.html',
					controller: 'signupController'
				}).
				when('/question',{
					templateUrl: 'app/partials/question.html',
					controller: 'questionController'
			});


			// use the HTML5 History API
			$locationProvider.html5Mode(true);
		}]);