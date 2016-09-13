/**
 * Created by Tim on 09/09/16.
 */

require('../../css/partials/join.css');

angular.module('charlieController').controller('joinController', ['$scope', '$state', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Joincontroller");

        $scope.fetching = false;
        $scope.serverErrors = {};

        $scope.changeView = function () {
            $scope.fetching = true;
            charlieProxy.joinQuiz({username: $scope.displayName, room: $scope.joinCode}, function(result) {
                $scope.fetching = false;
                if(result && !result.error) {
                    $state.go('lobby');
                } else {
                    $scope.serverErrors = result.error;
                }
            });
    };

}]);
