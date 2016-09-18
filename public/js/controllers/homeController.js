/**
 * Created by Tim on 17/09/16.
 */

require('../../css/partials/home.css');

module.exports =
    function ($scope, $state, charlieProxy) {
        console.log("Inside homeController");
        $scope.url = '';

        let init = function () {
            if (sessionStorage.getItem('code')) {
                charlieProxy.login(sessionStorage.getItem('code'), function (user) {
                    if (user) {
                        $state.go('main.loggedIn');
                    } else {
                        alert('User already logged in!');
                    }
                });
            } else {
                charlieProxy.getLoginUrl(function (url) {
                    $scope.url = url;
                });
            }
        };

        charlieProxy.onReady(function () {
            init();
        });

        $scope.login = function () {
            window.open($scope.url, '_self');
        };
    };