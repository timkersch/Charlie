'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
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
                    charlieProxy.joinQuiz(quiz.uuid, function(success) {
                       if (success) {
                           charlieProxy.setQuiz(quiz);
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
        $scope.quizname = "Simpas Quiz";
        $scope.users = [];
        
        var init = function(){
            charlieProxy.getQuiz(function(quiz){
                $scope.quizname = quiz.name;
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
            $location.path('/question');
        };
            
        charlieProxy.listenTo("quizStart", function(){
            console.log("Now started!!");
            $scope.$apply(function(){
                $location.path('/question');
            });
        });

        
    }]);

charlieController.controller('signupController', [ '$scope', 'charlieProxy',
    function($scope, charlieProxy) {
        console.log("Init");

        $scope.publish = function () {
            console.log("Publish");
        };

        $scope.create = function (){
            console.log("create");

        };

        $scope.register = function (){
            console.log("register");

        };
    }]);

charlieController.controller('homeController', [ '$scope', '$location', 'charlieProxy',
    function($scope, $location, charlieProxy) {
        $scope.changeView = function(data){
            $location.path(data);
        }
        console.log("Init");
    }]);

charlieController.controller('questionController', [ '$scope', '$location', '$interval', 'charlieProxy', '$document',
    function($scope, $location, $interval, charlieProxy, $document) {
        console.log("Inside questionController");
        $scope.determinateValue = 20;
        $scope.activated = true;
        var audioElement = $document[0].createElement('audio');
        var hasIndex = '';
        var hasAnswered = false;
        
        var play = function(url) {
            // Play song
            audioElement.src = url + ".mp3";
            audioElement.play();
        };
        
        var init = function(){
            if (!charlieProxy.isOwner()){
                charlieProxy.getQuestion(function(data){
                    //play(data.track_url);
                    $scope.possibleArtists = data.artists;
                });
            }else{
                charlieProxy.nextQuestion(function(data){
                    play(data.track_url);
                    $scope.possibleArtists = data.artists;
                });
            }
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
        
        charlieProxy.listenTo("newQuestion", function(question){
           $scope.possibleArtists = question.artists;
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
                });
            }
        };

        $scope.retriveCursor = function() {
            return hasAnswered ? 'selected' : 'notSelected';
        }

        $scope.setColor = function(index) {
          switch (index) {
            case 0: return 'green';
            case 1: return 'red';
            case 2: return 'blue';
            case 3: return 'yellow';
            default: return 'grey';
          }
        };

        $scope.isSelected = function(data){
            return $scope.selected === data;
        };

        $scope.setAnswer2 = function(data){
            $scope.selected = data.artist;
        };

        var intervalPromise = $interval(function(){
            $scope.determinateValue--;
            if($scope.determinateValue === -1){
                if (charlieProxy.isOwner()) {
                    charlieProxy.nextQuestion(function(data){
                        play(data.track_url);
                        $scope.possibleArtists = data.artists;
                    });
                }
                
                $scope.determinateValue = 20;
                hasAnswered = false;
                hasIndex = '';
            }
        }, 1000, 0, true);
        
        $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });
    }]);

charlieController.controller('scoreboardController', [ '$scope', '$location' , 'charlieProxy',
    function($scope, $location, charlieProxy) {
        console.log("Inside scoreboardController");
        var color = ["#8ef0aa","#ffff66"," #66ffff", "#ff5b4d" ];
        var dataArray = [];
        $scope.isDisabled = false;
        $scope.playlistText = "Save playlist to Spotify";
        
        
        var ctx = document.getElementById("scoreboardChart").getContext("2d");
        var sChart = new Chart(ctx).Doughnut();
        
        var init = function(){
            charlieProxy.getResults(function(users){
                for(var i = 0; i < users.length; i++){
                    var data = {
                        value : users[i].points,
                        userName: users[i].name,
                        color: color[i]
                    };
                    dataArray.push(data);
                }
                $scope.scoreData = dataArray;

                for(var i = 0; i < $scope.scoreData.length; i++){
                    sChart.addData($scope.scoreData[i]);
                };
            });
        };

        // Initialize when service is ready
        if (charlieProxy.isReady()){
            console.log("Ready now?")
            init();
        }else{
            $scope.$on('service-ready', function(event, args) {
                init();
            });
        }
    
        $scope.changeView = function(view){
            console.log("Changing view to: " + view);
            $location.path(view); // path not hash
        };
        
        $scope.savePlaylist = function(){
            charlieProxy.savePlaylist();
            $scope.isDisabled = true;
            $scope.playlistText = "Playlist added";
            
        }
        


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
            console.log("Submitting..." + " " + $scope.name + " " + $scope.nbrOfQuestions + " " + $scope.tags + " " + $scope.playlistSelected + "  toggleSwitch: " + $scope.toggleSwitch);
            
            // TODO generate quiz
            charlieProxy.createQuiz($scope.name, $scope.tags, $scope.playlistSelected.id, $scope.playlistSelected.owner.id, $scope.nbrOfQuestions, $scope.toggleSwitch, function(quiz){
               $location.path('/lobby'); 
            });
            
        };

    }]);