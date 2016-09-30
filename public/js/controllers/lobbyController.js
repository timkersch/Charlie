/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/lobby.css');

module.exports =
    function ($scope, $state, socketService, apiService) {
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

        apiService.getQuiz(function (quiz) {
            if(quiz) {
                $scope.quizname = quiz.name;
                $scope.owner = quiz.owner;
                $scope.id = quiz.quizID;
                $scope.isOwner = apiService.isQuizOwner();
                $scope.players = quiz.players;
                $scope.nbrOfSongs = quiz.nbrOfSongs;
                $scope.generated = quiz.playlist.generated;
                $scope.playlistName = quiz.playlist.name;
                $scope.playlisOwner = quiz.playlist.owner;
            } else {
                // TODO redirect
            }
        });

        socketService.userJoined(function (user) {
            $scope.players.push(user);
            $scope.$apply();
        });

        socketService.userLeft(function (user) {
            for (let i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].userID === user) {
                    $scope.players.splice(i, 1);
                    $scope.$apply();
                    break;
                }
            }
        });

        $scope.startQuiz = function () {
            if (apiService.isQuizOwner()) {
                socketService.nextQuestion();
            }
        };

        socketService.quizStart(function () {
            $state.go('main.question');
        });

        $scope.$on('$destroy', function () {
            if($state.current.name !== 'main.question') {
                socketService.leaveQuiz();
            }
            socketService.unregisterUserListeners();
        });

    };