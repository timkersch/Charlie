/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('homeController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Homecontroller");

        $scope.beginButton = "Create Quiz";

        $scope.changeView = function () {
            if($scope.joinText && $scope.joinText.length > 0) {
                charlieProxy.joinQuiz($scope.joinText, function(result) {
                    if(result && !result.error) {
                        $location.path('/lobby');
                    } else {
                        alert(result.error);
                    }
                });
            } else {
                $location.path('/create');
            }
        };

        $scope.isLoggedIn = function () {
            return charlieProxy.isLoggedIn();
        };

        $scope.joinTextChange = function () {
            if($scope.joinText && $scope.joinText.length > 0) {
                $scope.beginButton = "Join Quiz";
            } else {
                $scope.beginButton = "Create Quiz";
            }
        };

    }]);
