'use strict';

let charlieController = angular.module("charlieController", [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

let charlieApp = angular.module("charlieApp", [
    'ngMessages',
    'charlieController',
    'ui.router',
    'routeStyles'
]);

charlieApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider

        .state('home', {
            url: '/',
            templateUrl: '../views/home.html',
            controller: 'homeController',
            css: '../css/partials/home.css'
        })

        .state('lobby', {
            url: '/lobby',
            templateUrl: '../views/lobby.html',
            controller: 'lobbyController',
            css: '../css/partials/lobby.css'
        })

        .state('join', {
            url: '/join',
            templateUrl: '../views/join.html',
            controller: 'joinController',
            css: '../css/partials/join.css'
        })

        .state('create', {
            url: '/create',
            templateUrl: '../views/create.html',
            controller: 'createController',
            css: '../css/partials/create.css'
        })

        .state('create2', {
            url: '/create2',
            templateUrl: '../views/create2.html',
            controller: 'createNavigationController',
            css: '../css/partials/create2.css'
        })

        .state('create2.createPlaylist', {
            url: '/playlist',
            templateUrl: '../views/createFromPlaylist'
        })

        .state('profile', {
            url: '/profile',
            templateUrl: '../views/profile.html',
            controller: 'profileController',
            css: '../css/partials/profile.css'
        })

        .state('scoreboard', {
            url: '/scoreboard',
            templateUrl: '../views/scoreboard.html',
            controller: 'scoreboardController',
            css: '../css/partials/scoreboard.css'
        })

        .state('question', {
            url: '/question',
            templateUrl: '../views/question.html',
            controller: 'questionController',
            css: '../css/partials/question.css'
        });

}]);