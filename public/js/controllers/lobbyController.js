/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/lobby.css');

angular.module('charlieController').controller('lobbyController', ['$scope', '$state', 'charlieProxy',
    function ($scope, $state, charlieProxy) {
        console.log("LobbyController!");

        $scope.quizname = "Quiz";
        $scope.id = "Id";
        $scope.users = [];
        $scope.isOwner = false;
        $scope.owner = '';

        let init = function () {
            charlieProxy.getQuiz(function (quiz) {
                $scope.quizname = quiz.name;
                $scope.owner = quiz.owner;
                $scope.id = quiz.quizID;
                $scope.isOwner = charlieProxy.isQuizOwner();
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        charlieProxy.userJoined(function(user) {
            $scope.$apply(function () {
                $scope.users.push(user);
            });
        });

        $scope.startQuiz = function () {
            if (charlieProxy.isQuizOwner()) {
                charlieProxy.nextQuestion();
            }
        };

        charlieProxy.quizStart(function() {
            $scope.$apply(function () {
                $state.go('question');
            });
        });

    }]);