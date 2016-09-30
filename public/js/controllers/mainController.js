/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/home.css');

module.exports =
    function ($scope, $state, $mdSidenav, apiService) {
        console.log('in mainController');

        $scope.user = '';

        $scope.toggleLeftMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.isLoggedIn = function () {
            return apiService.isLoggedIn();
        };

        $scope.changeView = function (viewString) {
            $mdSidenav('left').toggle();
            if (viewString === 'home') {
                if (apiService.isLoggedIn()) {
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

        apiService.getUser(function (user) {
            if(user) {
                $scope.user = user;
                if($state.current.name === 'main.loggedOut') {
                    $state.go('main.loggedIn');
                }
            }
        });

        $scope.logout = function () {
            apiService.logout();
            window.open('/logout', '_self');
        };
    };