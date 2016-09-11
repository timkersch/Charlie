/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('mainController', ['$scope', '$route', '$routeParams', '$location', '$mdToast', 'charlieProxy', '$mdSidenav',
    function ($scope, $route, $routeParams, $location, $mdToast, charlieProxy, $mdSidenav) {
        $scope.user = '';
        $scope.url = '';

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
                        if(user) {
                            $scope.user = user;
                        } else {
                            alert('User already logged in!');
                        }
                    });
                } else {
                    charlieProxy.getLoginUrl(function (url) {
                        $scope.url = url;
                    });
                }
            }
        };

        $scope.$on("$stateChangeSuccess", function () {
            // Initialize when service is ready
            charlieProxy.onReady(function () {
                init();
            });
        });

        $scope.login = function () {
            window.open($scope.url, '_self');
        };

        $scope.logout = function () {
            $scope.user = '';
            charlieProxy.logout();
        };

    }]);