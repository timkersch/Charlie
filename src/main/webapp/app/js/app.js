'use strict';

	var charlieApp = angular.module('charlieApp', [
		'ngRoute',
		'ngMaterial',
		'ngMdIcons',
		'charlieController'
	]);

	charlieApp.config(['$routeProvider',
		function($routeProvider){
			console.log("routeprovidder");
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
		}]);