'use strict';

	var charlieApp = angular.module('charlieApp', [
		'ngRoute',
		'ngMaterial',
		'ngMdIcons'
		/*'signupService'*/
	]);

	charlieApp.config(['$routeProvider',
		function($routeProvider){
			console.log("Helo");
			$routeProvider.when('/test', {
				templateUrl: 'views/lobbyview.html',
				controller: 'lobbyController' 	
			}).
			otherwise({
				redirectTo: 'views/lobbyview.html'
			});	
		}]);