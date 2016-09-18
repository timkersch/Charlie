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
require('./controllers/homeController');
require('./controllers/mainController');
require('./controllers/profileController');
require('./controllers/questionController');
require('./controllers/scoreboardController');

charlieApp.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo', {
            'default': '500',
            'hue-1': '800',
            'hue-2': '300',
        })
        .accentPalette('green', {
            'default': 'A400'
        });
});

charlieApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider

        .state('main', {
            url: '',
            views: {
                'header': {
                    templateUrl: '../views/main.html',
                    controller: 'mainController'
                },
            },
            abstract: true,
        })

        .state('main.loggedOut', {
            url: '/',
            views: {
                'container@': {
                    templateUrl: '../views/homeLoggedOut.html',
                    controller: 'homeController'
                }
            },
        })

        .state('main.loggedIn', {
            url: '/home',
            views: {
                'container@': {
                    templateUrl: '../views/homeLoggedIn.html'
                }
            },
        })

        .state('main.lobby', {
            url: '/lobby',
            views: {
                'container@': {
                    templateUrl: '../views/lobby.html',
                    controller: 'lobbyController'
                }
            },
        })

        .state('main.join', {
            url: '/join',
            views: {
                'container@': {
                    templateUrl: '../views/join.html',
                    controller: 'joinController'
                }
            },
        })

        .state('main.profile', {
            url: '/profile',
            views: {
                'container@': {
                    templateUrl: '../views/profile.html',
                    controller: 'profileController'
                }
            },
        })

        .state('main.scoreboard', {
            url: '/scoreboard',
            views: {
                'container@': {
                    templateUrl: '../views/scoreboard.html',
                    controller: 'scoreboardController'
                }
            },
        })

        .state('main.question', {
            url: '/question',
            views: {
                'container@': {
                    templateUrl: '../views/question.html',
                    controller: 'questionController'
                }
            },
        })

        .state('main.create', {
            url: '/create',
            views: {
                'container@': {
                    templateUrl: '../views/createNavBar.html',
                    controller: 'createNavController'
                }
            },
            abstract: true
        })

        .state('main.create.choosePlaylist', {
            url: '/simple',
            views: {
                'container@main.create': {
                    templateUrl: '../views/choosePlaylist.html',
                    controller: 'choosePlaylistController'
                }
            },
        })

        .state('main.create.fromPlaylist', {
            url: '/simple/:owner/:name/:id',
            views: {
                'container@main.create': {
                    templateUrl: '../views/createFromPlaylist.html',
                    controller: 'createFromPlaylistController'
                }
            }
        })

        .state('main.create.generateFromPlaylist', {
            url: '/generate',
            views: {
                'container@main.create': {
                    templateUrl: '../views/generateFromPlaylist.html'
                }
            }
        })

        .state('main.create.createFromFeatured', {
            url: '/featured',
            views: {
                'container@main.create': {
                    templateUrl: '../views/createFromFeatured.html'
                }
            }
        })

        .state('main.create.createFromPopular', {
            url: '/popular',
            views: {
                'container@main.create': {
                    templateUrl: '../views/createFromPopular.html'
                }
            }
        });


    $urlRouterProvider.when("/create", "/create/simple");
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

}]);