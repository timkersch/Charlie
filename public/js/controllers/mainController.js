/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/home.css');

module.exports =
    function ($scope, $state, $mdSidenav, charlieProxy) {
        console.log('in mainController');
        $scope.user = '';

        $scope.toggleLeftMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.isLoggedIn = function () {
            return charlieProxy.isLoggedIn();
        };

        $scope.changeView = function (viewString) {
            $mdSidenav('left').toggle();
            if (viewString === 'home') {
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

        charlieProxy.getUser(function (user) {
            if(user) {
                $scope.user = user;
                $state.go('main.loggedIn');
            }
        });

        $scope.logout = function () {
            charlieProxy.logout();
            window.open('/logout', '_self');
        };
    };