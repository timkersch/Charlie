'use strict';

var charlieApp = angular.module('charlieApp', [
    'ngMaterial',
	'signupService'
]);

charlieApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.when('/', {
			templateUrl: '.html',
			controller: 'exempelController' 	
		});	
	}]);