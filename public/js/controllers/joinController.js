/**
 * Created by Tim on 09/09/16.
 */

require('../../css/partials/join.css');

module.exports =
    function ($scope, $state, charlieProxy) {
        console.log("Joincontroller");

        $scope.fetching = false;
        $scope.serverErrors = {};

        $scope.changeView = function () {
            $scope.fetching = true;
            charlieProxy.getUser(function(user) {
                const name = user ? user : $scope.displayName;
                charlieProxy.joinQuiz({username: name, room: $scope.joinCode}, function (result) {
                    $scope.fetching = false;
                    if (result && !result.error) {
                        $state.go('main.lobby');
                    } else {
                        $scope.serverErrors = result.error;
                    }
                });
            });
        };

        $scope.isLoggedIn = function() {
            return charlieProxy.isLoggedIn();
        };
    };
