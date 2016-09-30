/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/create.css');

module.exports =
    function ($scope, $state, $stateParams, socketService) {
        console.log("createFromPlaylistController");

        $scope.fetching = false;
        $scope.serverErrors = {};

        $scope.nbrOfQuestions = "";
        $scope.shuffle = true;
        $scope.name = null;

        $scope.createQuiz = function () {
            $scope.fetching = true;
            socketService.createQuiz($scope.name, $stateParams.id, $stateParams.name, $stateParams.owner, $scope.nbrOfQuestions, $scope.shuffle, function (quiz) {
                $scope.fetching = false;
                if (quiz && !quiz.error) {
                    $state.go('main.lobby');
                } else {
                    $scope.serverErrors = quiz.error;
                }
            });
        };
    };