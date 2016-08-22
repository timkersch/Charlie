'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$routeParams', '$location', '$mdToast', 'charlieProxy', '$mdSidenav',
    function ($scope, $routeParams, $location, $mdToast, charlieProxy, $mdSidenav) {
        $scope.user = {};
        $scope.url = "";

        $scope.changeView = function (view) {
            $location.path(view); // path not hash
            $scope.toggleLeftMenu();
        };

        $scope.toggleLeftMenu = function () {
            $mdSidenav('left').toggle();
        };

        $scope.isLoggedIn = function () {
            return charlieProxy.isLoggedIn();
        };

        var init = function () {
            if (charlieProxy.isLoggedIn()) {
                charlieProxy.getUser(function (user) {
                    $scope.user = user;
                });
            } else {
                if ($routeParams.code) {
                    charlieProxy.login($routeParams.code, function (user) {
                        $scope.user = user;
                        $location.path("/");
                    });
                } else {
                    charlieProxy.getLoginUrl(function (url) {
                        console.log("got a url", url);
                        $scope.url = url;
                    });
                }
            }
        };

        $scope.$on('$routeChangeSuccess', function () {
            // Initialize when service is ready
            charlieProxy.onReady(function () {
                init();
            });
        });

        var showActionToast = function (quiz) {
            var toast = $mdToast.simple()
                    .textContent('You have been invited to ' + quiz.name)
                    .action('ACCEPT')
                    .highlightAction(true)
                    .hideDelay(10 * 1000);

            $mdToast.show(toast).then(function (response) {
                if (response == 'ok') {
                    charlieProxy.joinQuiz(quiz, function (success) {
                        if (success) {
                            $location.path('/lobby');
                        } else {
                            alert('Something went wrong joining the quiz!');
                        }
                    });
                }
            });
        };

        charlieProxy.listenTo("invitedTo", function (quiz) {
            showActionToast(quiz);
        });

        $scope.login = function () {
            window.location.href = $scope.url;
        };

        $scope.logout = function () {
            $scope.user = {};
            charlieProxy.logout();
            charlieProxy.getLoginUrl(function (url) {
                $scope.url = url;
            });
        };

    }]);

charlieController.controller('lobbyController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("LobbyController!");
        $scope.status = '  ';
        $scope.quizname = "Quiz";
        $scope.users = [];
        $scope.isOwner = false;

        var init = function () {
            charlieProxy.getQuiz(function (quiz) {
                $scope.quizname = quiz.name;
                $scope.isOwner = charlieProxy.isQuizOwner();
                charlieProxy.getUsersInQuiz(function (users) {
                    $scope.users = users;
                });
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        charlieProxy.listenTo("userJoined", function (user) {
            console.log(user);
            $scope.$apply(function () {
                $scope.users.push(user);
            });
        });

        $scope.startQuiz = function () {
            //$location.path('/question');
            if (charlieProxy.isQuizOwner())
                charlieProxy.nextQuestion(function (data) {
                });
        };

        charlieProxy.listenTo("quizStart", function () {
            console.log("Now started!!");
            $scope.$apply(function () {
                $location.path('/question');
            });
        });


    }]);

charlieController.controller('homeController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        $scope.changeView = function (data) {
            $location.path(data);
        };

        $scope.isLoggedIn = function () {
            return charlieProxy.isLoggedIn();
        };

        console.log("Init");
    }]);

charlieController.controller('questionController', ['$scope', '$location', '$interval', 'charlieProxy', '$document', '$timeout',
    function ($scope, $location, $interval, charlieProxy, $document, $timeout) {
        console.log("Inside questionController");
        $scope.timeLeft = 20;
        $scope.activated = true;
        $scope.showScores = false;
        $scope.correctAnswer = "";
        $scope.myAnswer = "";
        $scope.currentQuestion = 1;
        $scope.lastQuestion = 1;
        var audioElement = $document[0].createElement('audio');
        var hasAnswered = false;
        var intervalPromise;
        $scope.players = [];

        var play = function (url) {
            // Stop previous
            audioElement.pause();
            audioElement.currentTime = 0;
            // Play song
            audioElement.src = url + ".mp3";
            audioElement.play();
        };

        var nextQuestion = function () {
            charlieProxy.nextQuestion(function (data) {
            });
        };

        var init = function () {
            $scope.lastQuestion = charlieProxy.getNumberOfQuestions();
            charlieProxy.getResults(function (players) {
                $scope.players = players;
            });
            charlieProxy.getCurrentQuestion(function (question) {
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

        charlieProxy.listenTo("gameOver", function (users) {
            $location.path("/scoreboard");
        });

        charlieProxy.listenTo("userPointsUpdate", function (player) {
            console.log("Player: " + player.name);
            var found = false;
            for (var i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].name === player.name) {
                    $scope.players[i].points = player.points;
                    found = true;
                    break;
                }
            }
            if (!found)
                $scope.players.push(player);
        });

        charlieProxy.listenTo("newQuestion", function (question) {
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

        var startInterval = function () {
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
                            nextQuestion();
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

charlieController.controller('scoreboardController', ['$scope', '$document', '$location', 'charlieProxy',
    function ($scope, $document, $location, charlieProxy) {
        console.log("Inside scoreboardController");
        $scope.scores = [];
        var canvasChart = $document[0].createElement('canvas');
        $scope.chart = {
            values: [],
            labels: [],
            colors: ["#F44336", "#9C27B0", "#00BCD4", "#4CAF50", "#FFC107", "#795548"],
            options: {
                responsive: false,
                maintainAspectRatio: false
            }
        };
        $scope.isDisabled = false;
        $scope.playlistText = "Save playlist to Spotify";
        var chartColors = ["#80CBC4", "#FF8A80", "#8C9EFF", "#FFEB3B"];
        var classColors = ['green-text', 'red-text', 'blue-text', 'yellow-text'];

        var init = function () {
            canvasChart.id = "scoreboardChart";
            canvasChart.width = "200";
            canvasChart.height = "200";
            canvasChart.style = "margin-top: 20px;";
            var scoreboardCenter = document.getElementById("centerScoreboard");
            charlieProxy.getResults(function (users) {
                if (users) {
                    var data = {
                        labels: [""],
                        datasets: []
                    };


                    $scope.scores = [];
                    $scope.chart.values = [];
                    $scope.chart.labels = [];
                    for (var i = 0; i < users.length; i++) {
                        /*Chart.js need to read data as an array*/
                        var tmpArray = [users[i].points];
                        console.log(tmpArray);
                        data.datasets.push({
                            fillColor: chartColors[i],
                            data: tmpArray
                        });
                        $scope.scores.push({
                            value: users[i].points,
                            userName: users[i].name,
                            color: classColors[i]

                        });

                    }

                    console.log(data);

                    setTimeout(function () {
                        scoreboardCenter.insertBefore(canvasChart, scoreboardCenter.firstChild);
                        var context = canvasChart.getContext("2d");
                        var scoreboardChart = new Chart(context).Bar(data);
                        $scope.$apply();
                    }, 50);


                }
            });
        };

        // Initialize when service is ready
        charlieProxy.onReady(function () {
            init();
        });

        $scope.changeView = function (view) {
            $location.path(view); // path not hash
        };

        $scope.savePlaylist = function () {
            charlieProxy.savePlaylist();
            $scope.isDisabled = true;
            $scope.playlistText = "Playlist added";
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
    }]);

charlieController.controller('profileController', ['$scope', 'charlieProxy',
    function ($scope, charlieProxy) {
        console.log("Inside profileController");

        charlieProxy.getUser(function (user) {
            $scope.user = user;
            console.log(user);
        });

    }]);

charlieController.controller('createController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Inside createController");
        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.playlistSelected = null;
        $scope.readonly = false;
        $scope.tags = [];
        $scope.toggleSwitch = true;
        $scope.loading = false;

        var init = function () {
            charlieProxy.getPlaylists(function (lists) {
                $scope.playlists = lists;
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        $scope.submit = function () {
            $scope.loading = true;
            charlieProxy.createQuiz($scope.name, $scope.tags, $scope.playlistSelected.id, $scope.playlistSelected.owner, $scope.nbrOfQuestions, $scope.toggleSwitch, function (quiz) {
                $location.path('/lobby');
            });

        };

    }]);