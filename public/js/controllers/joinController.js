/**
 * Created by Tim on 09/09/16.
 */

angular.module('charlieController').controller('joinController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Joincontroller");

        $scope.fetching = false;
        $scope.errorMessage = '';

        $scope.changeView = function () {
            $scope.fetching = true;
            if($scope.joinCode && $scope.joinCode.length > 0) {
                charlieProxy.joinQuiz($scope.joinCode, function(result) {
                    if(result && !result.error) {
                        $location.path('/lobby');
                    } else {
                        $scope.errorMessage = result.error;
                    }
                    $scope.fetching = false;
                });
            } else {
                $scope.fetching = false;
            }
        };

        $scope.isLoggedIn = function () {
            // TODO
        };

    }]);
