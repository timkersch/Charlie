/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('questionController', ['$scope', '$location', '$interval', 'charlieProxy', '$document', '$timeout',
    function ($scope, $location, $interval, charlieProxy, $document, $timeout) {
        console.log("Inside questionController");
        $scope.timeLeft = 20;
        $scope.activated = true;
        $scope.showScores = false;
        $scope.correctAnswer = "";
        $scope.myAnswer = "";
        $scope.currentQuestion = 1;
        $scope.lastQuestion = 1;
        let audioElement = $document[0].createElement('audio');
        let hasAnswered = false;
        let intervalPromise;
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
            charlieProxy.getCurrentQuestion(charlieProxy.getQuizID(), function (question) {
                if (question.artists) {
                    if (question.answer !== "") {
                        hasAnswered = true;
                        $scope.myAnswer = question.answer;
                        $scope.correctAnswer = question.correct;
                    }
                    $scope.currentQuestion = question.number;
                    $scope.possibleArtists = question.artists;
                    if (charlieProxy.isQuizOwner())
                        play(question.track_url);
                    startInterval();
                }
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        charlieProxy.gameOver(function(users) {
            $location.path("/scoreboard");
        });

        charlieProxy.userPointsUpdate(function (player) {
            console.log("Player: " + player.name);
            let found = false;
            for (let i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].name === player.name) {
                    $scope.players[i].points = player.points;
                    found = true;
                    break;
                }
            }
            if (!found)
                $scope.players.push(player);
        });

        charlieProxy.newQuestion(function (question) {
            console.log("New Question: " + question);
            $scope.possibleArtists = question.artists;
            if (charlieProxy.isQuizOwner())
                play(question.track_url);
            $scope.currentQuestion = question.number;
            $scope.timeLeft = 20;
            hasAnswered = false;
            $scope.showScores = false;
        });

        $scope.isDisabled = function (artist) {
            return hasAnswered && $scope.myAnswer !== artist;
        };

        $scope.selectedAnswer = function (data, index) {
            if (!hasAnswered) {
                $scope.myAnswer = data;
                hasAnswered = true;
                charlieProxy.answerQuestion(data, function (artist) {
                    console.log("Correct answer is: " + artist);
                    $scope.correctAnswer = artist;
                });
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

        let startInterval = function () {
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
            }
            intervalPromise = $interval(function () {
                if ($scope.timeLeft > 0)
                    $scope.timeLeft--;
                if ($scope.timeLeft === 0 && !$scope.showScores) {
                    if (!hasAnswered) {
                        $scope.selectedAnswer("", "");
                    }
                    $scope.showScores = true;
                    $scope.timeLeft = 5;
                    // Question over
                    if (charlieProxy.isQuizOwner()) {
                        $timeout(function () {
                            charlieProxy.nextQuestion(charlieProxy.getQuizID());
                        }, 5000);

                    }
                }
            }, 1000, 0, true);
        };

        $scope.$on('$destroy', function () {
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
            }
            // Stop previous
            audioElement.pause();
            audioElement.currentTime = 0;
        });
    }]);