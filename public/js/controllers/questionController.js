/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/question.css');

angular.module('charlieController').controller('questionController', ['$scope', '$state', 'charlieProxy', '$document',
    function ($scope, $state, charlieProxy, $document) {
        console.log("Inside questionController");

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

        let init = function () {
            $scope.lastQuestion = charlieProxy.getNumberOfQuestions();

            charlieProxy.getResults(function (players) {
                $scope.players = players;
            });

            charlieProxy.getCurrentQuestion(function (result) {
                $scope.currentQuestion = result.questionIndex+1;
                $scope.possibleArtists = result.question.artistOptions;
                correctAnswer = result.question.correctArtist;
                if (charlieProxy.isQuizOwner())
                    play(result.question.trackUrl);
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        charlieProxy.gameOver(function() {
            $state.go('main.scoreboard');
        });

        charlieProxy.userPointsUpdate(function (player) {
            for (let i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].userID === player.userID) {
                    $scope.players[i].points = player.points;
                    break;
                }
            }
        });

        charlieProxy.newQuestion(function (result) {
            $scope.possibleArtists = result.question.artistOptions;
            if (charlieProxy.isQuizOwner())
                play(result.question.trackUrl);
            $scope.currentQuestion = result.questionIndex+1;
            correctAnswer = result.question.correctArtist;
            $scope.timeLeft = 20;
            hasAnswered = false;
            $scope.showScores = false;
        });

        charlieProxy.timeLeft(function(time) {
            if(time > 5) {
                $scope.timeLeft = time-5;
            } else if(time <= 5 && time > 0) {
                if (!hasAnswered) {
                    $scope.selectedAnswer("", "");
                }
                $scope.showScores = true;
                $scope.timeLeft = time;
            } else {
                if (charlieProxy.isQuizOwner()) {
                    charlieProxy.nextQuestion();
                }
            }
        });

        $scope.isDisabled = function (artist) {
            return hasAnswered && $scope.myAnswer !== artist;
        };

        $scope.selectedAnswer = function (data, index) {
            if (!hasAnswered) {
                $scope.myAnswer = data;
                hasAnswered = true;
                charlieProxy.answerQuestion(data);
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
            audioElement.pause();
            audioElement.currentTime = 0;
        });
    }]);