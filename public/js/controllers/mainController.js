/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/home.css');

module.exports =
    function ($scope, $state, $mdSidenav, charlieProxy, $http) {
        console.log('in mainController');
        $scope.user = '';

        $scope.toggleLeftMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.isLoggedIn = function () {
            return charlieProxy.isLoggedIn();
        };

        $scope.changeView = function (viewString) {
            charlieProxy.leaveQuiz();
            charlieProxy.unregisterListeners();
            $mdSidenav('left').toggle();
            if (viewString === 'home') {

                $http({
                    method: 'GET',
                    url: '/api/test'
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });


                if (charlieProxy.isLoggedIn()) {
                    $state.go('main.loggedIn');
                } else {
                    $state.go('main.loggedOut');
                }
            } else if (viewString === 'profile') {
                $state.go('main.profile');
            } else if (viewString === 'create') {
                $state.go('main.create.choosePlaylist');
            }
        };

        let init = function () {
            if (charlieProxy.isLoggedIn()) {
                charlieProxy.getUser(function (user) {
                    $scope.user = user;
                });
            }
        };

        charlieProxy.onReady(function () {
            init();
        });

        $scope.logout = function () {
            $scope.user = '';
            charlieProxy.logout();
            $state.go('main.loggedOut');
        };

        $scope.$on('loggedIn', function () {
            $state.user = charlieProxy.getUser(function (user) {
                $scope.user = user;
            });
        });

    };