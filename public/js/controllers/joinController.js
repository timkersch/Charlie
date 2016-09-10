/**
 * Created by Tim on 09/09/16.
 */

angular.module('charlieController').controller('joinController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Joincontroller");

        $scope.fetching = false;
        $scope.serverErrors = {};

        $scope.changeView = function () {
            $scope.fetching = true;
            charlieProxy.joinQuiz({username: $scope.displayName, room: $scope.joinCode}, function(result) {
                if(result && !result.error) {
                    $location.path('/lobby');
                } else {
                    $scope.serverErrors = result.error;
                }
                $scope.fetching = false;
            });
    };

$scope.isLoggedIn = function () {
    // TODO
};

}]);
