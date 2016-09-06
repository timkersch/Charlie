'use strict';

let charlieController = angular.module("charlieController", [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

let charlieApp = angular.module("charlieApp", [
    'ngMessages',
    'charlieController',
    'routeStyles'
]);

charlieApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
                when('/', {
                    templateUrl: '../views/home.html',
                    controller: 'homeController',
                    css: '../css/partials/home.css'
                }).
                when('/lobby', {
                    templateUrl: '../views/lobby.html',
                    controller: 'lobbyController',
                    css: '../css/partials/lobby.css'
                }).
                when('/create', {
                    templateUrl: '../views/create.html',
                    controller: 'createController',
                    css: '../css/partials/create.css'
                }).
                when('/profile', {
                    templateUrl: '../views/profile.html',
                    controller: 'profileController',
                    css: '../css/partials/profile.css'
                }).
                when('/scoreboard', {
                    templateUrl: '../views/scoreboard.html',
                    controller: 'scoreboardController',
                    css: '../css/partials/scoreboard.css'
                }).
                when('/question', {
                    templateUrl: '../views/question.html',
                    controller: 'questionController',
                    css: '../css/partials/question.css'
                }).
                otherwise({redirectTo: '/'});

        $locationProvider.html5Mode(true);

    }]);