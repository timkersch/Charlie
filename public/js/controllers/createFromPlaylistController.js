/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('createFromPlaylistController', ['$scope', '$state', '$stateParams', 'charlieProxy',
    function ($scope, $state, $stateParams, charlieProxy) {
        console.log("Inside createFromPlaylistController");

        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.shuffle = true;
        $scope.loading = false;

        $scope.createQuiz = function () {
            $scope.loading = true;
            charlieProxy.createQuiz($scope.name, $stateParams.id, $stateParams.owner, $scope.nbrOfQuestions, $scope.shuffle, function (quiz) {
                $scope.loading = false;
                if(!quiz || quiz.error) {
                    alert(quiz.error);
                } else {
                    $state.go('lobby');
                }
            });
        };

    }]);