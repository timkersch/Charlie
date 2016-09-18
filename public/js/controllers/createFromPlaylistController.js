/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/create.css');
const angular = require('angular');

angular.module('charlieController').controller('createFromPlaylistController', ['$scope', '$state', '$stateParams', 'charlieProxy',
    function ($scope, $state, $stateParams, charlieProxy) {
        console.log("Inside createFromPlaylistController");

        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.shuffle = true;
        $scope.loading = false;

        $scope.createQuiz = function () {
            $scope.loading = true;
            charlieProxy.createQuiz($scope.name, $stateParams.id, $stateParams.name, $stateParams.owner, $scope.nbrOfQuestions, $scope.shuffle, function (quiz) {
                $scope.loading = false;
                if(!quiz || quiz.error) {
                    alert(quiz.error);
                } else {
                    $state.go('main.lobby');
                }
            });
        };

    }]);