'use strict';

	var charlieApp = angular.module('charlieApp', [
		'ngRoute',
		'ngMaterial',
		'charlieController'
	]);

	charlieApp.config(['$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider){
			$locationProvider.html5Mode(true);

			$routeProvider.
				when('/', {
					templateUrl: 'app/partials/lobby.html',
					controller: 'lobbyController'
				}).
				when('/signup', {
					templateUrl: 'app/partials/signup.html',
					controller: 'signupController'
				}).
				when('/create', {
				templateUrl: 'app/partials/create.html',
				controller: 'createController',
				css: 'app/css/partials/create.css'
				}).
				when('/scoreboard',{
					templateUrl: 'app/partials/scoreboard.html',
					controller: 'scoreboardController'
				}).
				when('/question',{
					templateUrl: 'app/partials/question.html',
					controller: 'questionController'
			}).otherwise({redirectTo: '/'});

			//$locationProvider.html5Mode(true);//.hashPrefix('!');
		}]);