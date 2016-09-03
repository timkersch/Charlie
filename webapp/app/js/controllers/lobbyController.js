/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('lobbyController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
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
                $scope.id = quiz.id;
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
                charlieProxy.startQuiz($scope.id);
            }
        };

        charlieProxy.quizStart(function() {
            $scope.$apply(function () {
                $location.path('/question');
            });
        });

    }]);