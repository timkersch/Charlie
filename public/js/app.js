'use strict';

const angular = require('angular');
require('angular-messages');
require('angular-ui-router');
require('angular-material');
require('angular-route');
require('./services/socketService');

let charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

let charlieApp = angular.module('charlieApp', [
    'ngMessages',
    'charlieController',
    'ui.router',
]);

charlieApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider

        .state('homeLoggedOut', {
            url: '/',
            templateUrl: '../views/homeLoggedOut.html',
            controller: 'mainController',
            data: {
                css: ['../css/partials/home.css']
            }
        })

        .state('homeLoggedIn', {
            url: '/',
            templateUrl: '../views/homeLoggedIn.html',
            controller: 'mainController',
            data: {
                css: ['../css/partials/home.css']
            }
        })

        .state('lobby', {
            url: '/lobby',
            templateUrl: '../views/lobby.html',
            controller: 'lobbyController',
            data: {
                css: ['../css/partials/lobby.css']
            }
        })

        .state('join', {
            url: '/join',
            templateUrl: '../views/join.html',
            controller: 'joinController',
            data: {
                css: ['../css/partials/join.css']
            }
        })

        .state('profile', {
            url: '/profile',
            templateUrl: '../views/profile.html',
            controller: 'profileController',
            data: {
                css: ['../css/partials/profile.css']
            }
        })

        .state('scoreboard', {
            url: '/scoreboard',
            templateUrl: '../views/scoreboard.html',
            controller: 'scoreboardController',
            data: {
                css: ['../css/partials/scoreboard.css']
            }
        })

        .state('question', {
            url: '/question',
            templateUrl: '../views/question.html',
            controller: 'questionController',
            data: {
                css: ['../css/partials/question.css']
            }
        })

        .state('create', {
            url: '/create',
            templateUrl: '../views/createNavBar.html',
            controller: 'createNavController',
            data: {
                css: ['../css/partials/create.css']
            },
            abstract: true
        })

        .state('create.choosePlaylist', {
            url: '/simple',
            controller: 'choosePlaylistController',
            templateUrl: '../views/choosePlaylist.html',
        })

        .state('create.fromPlaylist', {
            url: '/simple/:owner/:id',
            controller: 'createFromPlaylistController',
            templateUrl: '../views/createFromPlaylist.html',
        })

        .state('create.generateFromPlaylist', {
            url: '/generate',
            templateUrl: '../views/generateFromPlaylist.html',
        })

        .state('create.createFromFeatured', {
            url: '/featured',
            templateUrl: '../views/createFromFeatured.html',
        })

        .state('create.createFromPopular', {
            url: '/popular',
            templateUrl: '../views/createFromPopular.html',
        });


    $urlRouterProvider.when("/create", "/create/simple");
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

}]);