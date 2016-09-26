/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/lobby.css');

module.exports =
    function ($scope, $state, charlieProxy) {
        console.log("LobbyController!");

        $scope.quizname = '';
        $scope.owner = '';
        $scope.id = '';
        $scope.isOwner = false;
        $scope.players = [];
        $scope.nbrOfSongs = 0;
        $scope.generated = false;
        $scope.playlistName = '';
        $scope.playlisOwner = '';

        let init = function () {
            charlieProxy.getQuiz(function (quiz) {
                $scope.quizname = quiz.name;
                $scope.owner = quiz.owner;
                $scope.id = quiz.quizID;
                $scope.isOwner = charlieProxy.isQuizOwner();
                $scope.players = quiz.players;
                $scope.nbrOfSongs = quiz.nbrOfSongs;
                $scope.generated = quiz.playlist.generated;
                $scope.playlistName = quiz.playlist.name;
                $scope.playlisOwner = quiz.playlist.owner;
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        charlieProxy.userJoined(function (user) {
            $scope.players.push(user);
        });

        charlieProxy.userLeft(function (user) {
            for (let i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].userID === user) {
                    $scope.players.splice(i, 1);
                    break;
                }
            }
        });

        $scope.startQuiz = function () {
            if (charlieProxy.isQuizOwner()) {
                charlieProxy.nextQuestion();
            }
        };

        charlieProxy.quizStart(function () {
            $state.go('main.question');
        });

    };