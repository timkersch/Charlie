/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('mainController', ['$scope', '$routeParams', '$location', '$mdToast', 'charlieProxy', '$mdSidenav',
    function ($scope, $routeParams, $location, $mdToast, charlieProxy, $mdSidenav) {
        $scope.user = '';
        $scope.url = '';

        $scope.changeView = function (view) {
            $location.path(view); // path not hash
            $scope.toggleLeftMenu();
        };

        $scope.toggleLeftMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.isLoggedIn = function () {
            return charlieProxy.isLoggedIn();
        };

        let init = function () {
            if (charlieProxy.isLoggedIn()) {
                charlieProxy.getUser(function (user) {
                    $scope.user = user;
                });
            } else {
                if (sessionStorage.getItem('code')) {
                    charlieProxy.login(sessionStorage.getItem('code'), function (user) {
                        $scope.user = user;
                    });
                } else {
                    charlieProxy.getLoginUrl(function (url) {
                        $scope.url = url;
                    });
                }
            }
        };

        $scope.$on('$routeChangeSuccess', function () {
            // Initialize when service is ready
            charlieProxy.onReady(function () {
                init();
            });
        });

        $scope.login = function () {
            window.location.href = $scope.url;
        };

        $scope.logout = function () {
            $scope.user = {};
            charlieProxy.logout();
            charlieProxy.getLoginUrl(function (url) {
                $scope.url = url;
            });
        };

    }]);