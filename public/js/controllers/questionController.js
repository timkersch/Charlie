/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/question.css');

module.exports =
    function ($scope, $state, $document, socketService, apiService) {
        console.log("questionController");

        let audioElement = $document[0].createElement('audio');
        let hasAnswered = false;
        let correctAnswer = '';

        $scope.timeLeft = 20;
        $scope.activated = true;
        $scope.showScores = false;
        $scope.correctAnswer = "";
        $scope.myAnswer = "";
        $scope.currentQuestion = 1;
        $scope.lastQuestion = 1;
        $scope.players = [];

        let play = function (url) {
            // Stop previous
            audioElement.pause();
            audioElement.currentTime = 0;
            // Play song
            audioElement.src = url + ".mp3";
            audioElement.play();
        };

        apiService.getQuiz(function (quiz) {
            const question = quiz.questions[quiz.questionIndex];
            $scope.possibleArtists = question.artistOptions;
            $scope.players = quiz.players;
            $scope.currentQuestion = quiz.questionIndex + 1;
            $scope.lastQuestion = quiz.questions.length;
            correctAnswer = question.correctArtist;

            apiService.getUser(function(user) {
                for(let i = 0; i < quiz.players.length; i++) {
                    if (quiz.players[i].userID === user) {
                        $scope.myAnswer = quiz.players[i].answers[quiz.questionIndex];
                        hasAnswered = $scope.myAnswer !== '';
                        $scope.correctAnswer = hasAnswered ? correctAnswer : '';
                        break;
                    }
                }
            });

            if (apiService.isQuizOwner()) {
                play(question.trackUrl);
            }
        });

        socketService.gameOver(function () {
            $state.go('main.scoreboard');
        });

        socketService.userPointsUpdate(function (player) {
            for (let i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].userID === player.userID) {
                    $scope.players[i].points = player.points;
                    break;
                }
            }
        });

        socketService.newQuestion(function (result) {
            $scope.possibleArtists = result.question.artistOptions;
            if (apiService.isQuizOwner()) {
                play(result.question.trackUrl);
            }
            $scope.currentQuestion = result.questionIndex + 1;
            correctAnswer = result.question.correctArtist;
            $scope.timeLeft = 20;
            hasAnswered = false;
            $scope.showScores = false;
            $scope.$apply();
        });

        socketService.timeLeft(function (time) {
            if (time > 5) {
                $scope.timeLeft = time - 5;
            } else if (time <= 5 && time > 0) {
                if (!hasAnswered) {
                    $scope.selectedAnswer("", "");
                }
                $scope.showScores = true;
                $scope.timeLeft = time;
            } else {
                if (apiService.isQuizOwner()) {
                    socketService.nextQuestion();
                }
            }
            $scope.$apply();
        });

        $scope.isDisabled = function (artist) {
            return hasAnswered && $scope.myAnswer !== artist;
        };

        $scope.selectedAnswer = function (data) {
            if (!hasAnswered) {
                $scope.myAnswer = data;
                hasAnswered = true;
                socketService.answerQuestion(data);
                $scope.correctAnswer = correctAnswer;
            }
        };

        $scope.retriveCursor = function () {
            return hasAnswered ? 'selected' : 'notSelected';
        };

        $scope.getColor = function (index) {
            switch (index) {
                case 0:
                    return 'green';
                case 1:
                    return 'red';
                case 2:
                    return 'blue';
                case 3:
                    return 'yellow';
                default:
                    return 'grey';
            }
        };

        $scope.getTextColor = function (index) {
            switch (index) {
                case 0:
                    return 'green-text';
                case 1:
                    return 'red-text';
                case 2:
                    return 'blue-text';
                case 3:
                    return 'yellow-text';
                default:
                    return 'grey-text';
            }
        };

        $scope.$on('$destroy', function () {
            socketService.unregisterAllListeners();
            audioElement.pause();
            audioElement.currentTime = 0;
        });
    };