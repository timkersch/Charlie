'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'chart.js',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$routeParams', '$location', '$mdToast', 'charlieProxy', '$mdSidenav',
    function($scope, $routeParams, $location, $mdToast, charlieProxy, $mdSidenav) {
        $scope.user = {};
        $scope.url = "";

        $scope.changeView = function(view){
            console.log("Changing view to: " + view);
            $location.path(view); // path not hash
            $scope.toggleLeftMenu();
        };

        $scope.toggleLeftMenu = function() {
            $mdSidenav('left').toggle();
        };

        var init = function(){
            if (charlieProxy.isLoggedIn()) {
                charlieProxy.getUser(function(user){
                   $scope.user = user;
                });
            } else {
                if ($routeParams.code){
                    charlieProxy.login($routeParams.code, function(user){
                        $scope.user = user;
                        $location.path("/");
                    });
                } else {
                    charlieProxy.getLoginUrl(function(url){
                        $scope.url = url;
                    });
                }
            }
        };

        $scope.$on('$routeChangeSuccess', function() {
            // Initialize when service is ready
            if (charlieProxy.isReady()){
                init();
            }else{
                $scope.$on('service-ready', function(event, args) {
                    init();
                });
            }
        });
        
        var showActionToast = function(quiz) {
            var toast = $mdToast.simple()
                .textContent('You are invited to ' + quiz.name)
                .action('ACCEPT')
                .highlightAction(true)
                .hideDelay(10 * 1000);
    
            $mdToast.show(toast).then(function(response) {
                if ( response == 'ok' ) {
                    charlieProxy.joinQuiz(quiz, function(success) {
                       if (success) {
                           $location.path('/lobby');
                       } else {
                           alert('Something went wrong joining the quiz!');
                       }
                    });
                }
            });
        };
        
        charlieProxy.listenTo("invitedTo", function(quiz) {
            showActionToast(quiz);
        });

        $scope.login = function (){
            console.log("login");
            window.location.href = $scope.url;
        };

        $scope.logout = function (){
            console.log("logout");
            $scope.user = {};
            charlieProxy.logout();
            charlieProxy.getLoginUrl(function(url){
                $scope.url = url;
            });
        };
        
    }]);

charlieController.controller('lobbyController', ['$scope', '$location', 'charlieProxy',
    function($scope, $location, charlieProxy){
        console.log("LobbyController!");
        $scope.status = '  ';
        $scope.quizname = "Quiz";
        $scope.users = [];
        $scope.isOwner = false;
        
        var init = function(){
            charlieProxy.getQuiz(function(quiz){
                $scope.quizname = quiz.name;
                $scope.isOwner = charlieProxy.isQuizOwner();
                charlieProxy.getUsersInQuiz(function(users){
                    $scope.users = users;
                });
            });
        };
        
        if (charlieProxy.isReady()){
            init();
        }else{
            $scope.$on('service-ready', function(event, args) {
                init();
            });
        }
        
        charlieProxy.listenTo("userJoined", function(user){
            console.log(user);
            $scope.$apply(function(){
                $scope.users.push(user);
            });
        });
        
        $scope.startQuiz = function(){
            //$location.path('/question');
            if (charlieProxy.isQuizOwner())
                charlieProxy.nextQuestion(function(data){});
        };
            
        charlieProxy.listenTo("quizStart", function(){
            console.log("Now started!!");
            $scope.$apply(function(){
                $location.path('/question');
            });
        });

        
    }]);

charlieController.controller('homeController', [ '$scope', '$location',
    function($scope, $location) {
        $scope.changeView = function(data){
            $location.path(data);
        };
        console.log("Init");
    }]);

charlieController.controller('questionController', [ '$scope', '$location', '$interval', 'charlieProxy', '$document',
    function($scope, $location, $interval, charlieProxy, $document) {
        console.log("Inside questionController");
        $scope.timeLeft = 20;
        $scope.activated = true;
        $scope.showScores = false;
        var audioElement = $document[0].createElement('audio');
        var hasIndex = '';
        var hasAnswered = false;
        var intervalPromise;
        $scope.players = [];
        
        var play = function(url) {
            // Stop previous
            audioElement.pause();
            audioElement.currentTime = 0;
            // Play song
            audioElement.src = url + ".mp3";
            audioElement.play();
        };
        
        var nextQuestion = function(){
            charlieProxy.nextQuestion(function(data){});  
        };
        
        var init = function(){
            charlieProxy.getResults(function(players){
                $scope.players = players;
            });
            charlieProxy.getCurrentQuestion(function(data){
                if (data.artists) {
                    if (data.answered)
                        $scope.showScores = true;
                    
                    $scope.possibleArtists = data.artists;
                    if (charlieProxy.isQuizOwner())
                        play(data.track_url);
                    startInterval();
                }
            });
        };
        
        if (charlieProxy.isReady()){
            init();
        }else{
            $scope.$on('service-ready', function(event, args) {
                init();
            });
        }
        
        charlieProxy.listenTo("gameOver", function(users){
           $location.path("/scoreboard"); 
        });
        
        charlieProxy.listenTo("userPointsUpdate", function(player){
            console.log("Player: " + player.name);
            var found = false;
            for (var i = 0; i < $scope.players.length; i++) {
                if ($scope.players[i].name === player.name){
                    $scope.players[i].points = player.points;
                    found = true;
                    break;
                }
            }
            if (!found)
                $scope.players.push(player);
        });
        
        charlieProxy.listenTo("newQuestion", function(question){
            $scope.possibleArtists = question.artists;
            if (charlieProxy.isQuizOwner())
                play(question.track_url);
            $scope.timeLeft = 20;
            hasAnswered = false;
            hasIndex = '';
            $scope.showScores = false;
        });
        
        $scope.isDisabled = function(index){
            return hasAnswered && hasIndex !== index;
        };
        
        $scope.selectedAnswer = function(data, index){
            if (!hasAnswered) {
                hasAnswered = true;
                hasIndex = index;
                charlieProxy.answerQuestion(data, function(correct){
                   console.log("Answer correct: " + correct); 
                   $scope.showScores = true;
                });
            }
        };

        $scope.retriveCursor = function() {
            return hasAnswered ? 'selected' : 'notSelected';
        };

        $scope.getColor = function(index) {
          switch (index) {
            case 0: return 'green';
            case 1: return 'red';
            case 2: return 'blue';
            case 3: return 'yellow';
            default: return 'grey';
          }
        };
        
        $scope.getTextColor = function(index) {
          switch (index) {
            case 0: return 'green-text';
            case 1: return 'red-text';
            case 2: return 'blue-text';
            case 3: return 'yellow-text';
            default: return 'grey-text';
          }
        };

        var startInterval = function (){
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
            }
            intervalPromise = $interval(function(){
                $scope.timeLeft--;
                if($scope.timeLeft === -1){
                $scope.timeLeft = 0;
                    // Question over
                    if (charlieProxy.isQuizOwner())
                        nextQuestion();
                }
            }, 1000, 0, true);
        };
        
        $scope.$on('$destroy', function() {
            if (angular.isDefined(intervalPromise)) {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
            }
            // Stop previous
            audioElement.pause();
            audioElement.currentTime = 0;
        });
    }]);

charlieController.controller('scoreboardController', [ '$scope', '$location' , 'charlieProxy',
    function($scope, $location, charlieProxy) {
        console.log("Inside scoreboardController");
        $scope.scores = [];
        $scope.chart = {
            values: [],
            labels: [],
            colors: ["#F44336","#9C27B0","#00BCD4", "#4CAF50", "#FFC107", "#795548"]
        };
        $scope.isDisabled = false;
        $scope.playlistText = "Save playlist to Spotify";
        
        var init = function(){
            charlieProxy.getResults(function(users){
                if (users) {
                    $scope.scores = [];
                    $scope.chart.values = [];
                    $scope.chart.labels = [];
                    for(var i = 0; i < users.length; i++){
                        $scope.scores.push({
                            value : users[i].points,
                            userName: users[i].name,
                            color: $scope.chart.colors[i % 4]
                        });
                        $scope.chart.values.push(users[i].points);
                        $scope.chart.labels.push(users[i].name);
                    }
                }
            });
        };

        // Initialize when service is ready
        if (charlieProxy.isReady()){
            init();
        }else{
            $scope.$on('service-ready', function(event, args) {
                init();
            });
        }
    
        $scope.changeView = function(view){
            $location.path(view); // path not hash
        };
        
        $scope.savePlaylist = function(){
            charlieProxy.savePlaylist();
            $scope.isDisabled = true;
            $scope.playlistText = "Playlist added";
        };
        
    }]);

charlieController.controller('profileController', [ '$scope', 'charlieProxy',
    function($scope, charlieProxy) {
        console.log("Inside profileController");

        charlieProxy.getUser(function(user){
            $scope.user = user;
            console.log(user);
        });

    }]);

charlieController.controller('createController', ['$scope', '$location', 'charlieProxy',
    function($scope, $location, charlieProxy) {
        console.log("Inside createController");
        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.playlistSelected = null;
        $scope.readonly = false;
        $scope.tags = [];
        $scope.toggleSwitch = true;
        var init = function (){
            charlieProxy.getPlaylists(function(lists){
                $scope.playlists = lists;
            }); 
        };
        
        if (charlieProxy.isReady()){
            init();
        }else{
            $scope.$on('service-ready', function(event, args) {
                init();
            });
        }

        $scope.submit = function() {
            charlieProxy.createQuiz($scope.name, $scope.tags, $scope.playlistSelected.id, $scope.playlistSelected.owner, $scope.nbrOfQuestions, $scope.toggleSwitch, function(quiz){
               $location.path('/lobby'); 
            });
            
        };

    }]);