/**
 * Created by Tim on 09/09/16.
 */

require('../../css/partials/join.css');

module.exports =
    function ($scope, $state, socketService) {
        console.log("joincontroller");

        $scope.fetching = false;
        $scope.serverErrors = {};

        $scope.changeView = function () {
            $scope.fetching = true;
                socketService.joinQuiz({room: $scope.joinCode}, function (result) {
                    $scope.fetching = false;
                    if (result && !result.error) {
                        $state.go('main.lobby');
                    } else {
                        console.log(result.error);
                        $scope.serverErrors = result.error;
                    }
                });
        };
    };
