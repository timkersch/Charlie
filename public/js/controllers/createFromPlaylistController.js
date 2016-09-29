/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/create.css');

module.exports =
    function ($scope, $state, $stateParams, socketService) {
        console.log("Inside createFromPlaylistController");

        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.shuffle = true;
        $scope.loading = false;

        $scope.createQuiz = function () {
            $scope.loading = true;
            socketService.createQuiz($scope.name, $stateParams.id, $stateParams.name, $stateParams.owner, $scope.nbrOfQuestions, $scope.shuffle, function (quiz) {
                $scope.loading = false;
                if (!quiz || quiz.error) {
                    alert(quiz.error);
                } else {
                    $state.go('main.lobby');
                }
            });
        };
    };