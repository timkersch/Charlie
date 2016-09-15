'use strict';

const angular = require('angular');
require('../css/style.css');
require('angular-material/angular-material.css');
require('angular-messages');
require('angular-ui-router');
require('angular-material');
require('./services/socketService');

let charlieController = angular.module('charlieController', [
    'charlieService',
    'ngMaterial',
    'ngMessages',
]);

let charlieApp = angular.module('charlieApp', [
    'charlieController',
    'ui.router',
]);

require('./controllers/choosePlaylistController');
require('./controllers/createFromPlaylistController');
require('./controllers/createNavController');
require('./controllers/joinController');
require('./controllers/lobbyController');
require('./controllers/mainController');
require('./controllers/profileController');
require('./controllers/questionController');
require('./controllers/scoreboardController');

charlieApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo', {
            'default': '500',
            'hue-1': '700', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '300', // use shade 600 for the <code>md-hue-2</code> class
        })
        .accentPalette('green', {
            'default': 'A400'
        });
});

charlieApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider

        .state('homeLoggedOut', {
            url: '/',
            templateUrl: '../views/homeLoggedOut.html',
            controller: 'mainController',
        })

        .state('homeLoggedIn', {
            url: '/',
            templateUrl: '../views/homeLoggedIn.html',
            controller: 'mainController',
        })

        .state('lobby', {
            url: '/lobby',
            templateUrl: '../views/lobby.html',
            controller: 'lobbyController',
        })

        .state('join', {
            url: '/join',
            templateUrl: '../views/join.html',
            controller: 'joinController',
        })

        .state('profile', {
            url: '/profile',
            templateUrl: '../views/profile.html',
            controller: 'profileController',
        })

        .state('scoreboard', {
            url: '/scoreboard',
            templateUrl: '../views/scoreboard.html',
            controller: 'scoreboardController',
        })

        .state('question', {
            url: '/question',
            templateUrl: '../views/question.html',
            controller: 'questionController',
        })

        .state('create', {
            url: '/create',
            templateUrl: '../views/createNavBar.html',
            controller: 'createNavController',
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