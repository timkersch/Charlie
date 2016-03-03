'use strict';

	var charlieApp = angular.module('charlieApp', [
		'ngRoute',
		'ngMaterial'
		/*'signupService'*/
	]);

	charlieApp.config(['$routeProvider',
		function($routeProvider){
			console.log("Helo");
			$routeProvider.when('/', {
				templateUrl: 'views/lobbyview.html',
				controller: 'lobbyController' 	
			}).
			otherwise({
				redirectTo: 'views/lobbyview.html'
			});	
		}]);