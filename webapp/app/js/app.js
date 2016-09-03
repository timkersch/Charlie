'use strict';

let charlieController = angular.module("charlieController", [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

let charlieApp = angular.module("charlieApp", [
    'ngMessages',
    'charlieController'
]);

charlieApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
                when('/', {
                    templateUrl: 'app/partials/home.html',
                    controller: 'homeController'
                }).
                when('/lobby', {
                    templateUrl: 'app/partials/lobby.html',
                    controller: 'lobbyController',
                    css: 'app/css/partials/lobby.css'
                }).
                when('/create', {
                    templateUrl: 'app/partials/create.html',
                    controller: 'createController',
                    css: 'app/css/partials/create.css'
                }).
                when('/profile', {
                    templateUrl: 'app/partials/profile.html',
                    controller: 'profileController',
                    css: 'app/css/partials/profile.css'
                }).
                when('/scoreboard', {
                    templateUrl: 'app/partials/scoreboard.html',
                    controller: 'scoreboardController'
                }).
                when('/question', {
                    templateUrl: 'app/partials/question.html',
                    controller: 'questionController'
                }).
                otherwise({redirectTo: '/'});

        $locationProvider.html5Mode(true);

    }]);