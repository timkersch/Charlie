require('angular');
require('../css/style.css');
require('angular-material/angular-material.css');
require('angular-material');
require('angular-messages');
require('angular-ui-router');
require('angular-material');

const charlieApp = angular.module('charlieApp', ['ui.router', 'ngMaterial', 'ngMessages']);

const charlieProxy = require('./services/socketService');
charlieApp.service('charlieProxy', charlieProxy);
charlieProxy.$inject = ['$rootScope'];

const choosePlaylistController = require('./controllers/choosePlaylistController');
const createFromPlaylistController = require('./controllers/createFromPlaylistController');
const createNavController = require('./controllers/createNavController');
const joinController = require('./controllers/joinController');
const lobbyController = require('./controllers/lobbyController');
const homeController = require('./controllers/homeController');
const mainController = require('./controllers/mainController');
const questionController = require('./controllers/questionController');
const scoreboardController = require('./controllers/scoreboardController');

charlieApp.controller('choosePlaylistController', choosePlaylistController);
charlieApp.controller('createFromPlaylistController', createFromPlaylistController);
charlieApp.controller('createNavController', createNavController);
charlieApp.controller('homeController', homeController);
charlieApp.controller('joinController', joinController);
charlieApp.controller('lobbyController', lobbyController);
charlieApp.controller('mainController', mainController);
charlieApp.controller('questionController', questionController);
charlieApp.controller('scoreboardController', scoreboardController);

choosePlaylistController.$inject = ['$scope', '$state', 'charlieProxy'];
createFromPlaylistController.$inject = ['$scope', '$state', '$stateParams', 'charlieProxy'];
createNavController.$inject = ['$scope', '$location'];
homeController.$inject = ['$scope', '$state', 'charlieProxy'];
joinController.$inject = ['$scope', '$state', 'charlieProxy'];
lobbyController.$inject = ['$scope', '$state', 'charlieProxy'];
mainController.$inject = ['$scope', '$state', '$mdSidenav', 'charlieProxy'];
questionController.$inject = ['$scope', '$state', 'charlieProxy', '$document'];
scoreboardController.$inject = ['$scope', '$document', '$state', 'charlieProxy'];

charlieApp.config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo', {
            'default': '500',
            'hue-1': '800',
            'hue-2': '300',
        })
        .accentPalette('green', {
            'default': 'A400'
        });
}]);

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
                    templateUrl: '../views/profile.html'
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