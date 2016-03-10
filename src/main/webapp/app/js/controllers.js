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
                console.log("Already done");
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
            .highlightAction(true);
    
            $mdToast.show(toast).then(function(response) {
                if ( response == 'ok' ) {
                    alert('You accepted the '+ quiz.name + ' invite.');
                    charlieProxy.joinQuiz(quiz.uuid, function(success) {
                       if (success) {
                           alert('Successfully joined the quiz!');
                       } else {
                           alert('Something went wrong! :(');
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

        /*var quizname = charlieProxy.getQuizname();*/
        //TODO add name
        $scope.quizname = "Simpas Quiz";
    
        $scope.users = [];
        charlieProxy.listenTo("userJoined", function(user){
            $scope.users.push(user.name);
        });
            

        $scope.startQuiz = function(){
            $location.path('/question');
        }
        
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
        
        var quiz = charlieProxy.getQuiz();
        var audioElement = $document[0].createElement('audio');
        charlieProxy.nextQuestion(function(data){
            // Play song
            audioElement.src = data.track_url + ".mp3";
            audioElement.play();
            
            $scope.possibleArtists = data.artists;
        });
        
        var questionNumber = 0;
        var answer = "";
        $scope.activated = true;
        

        var hasIndex = '';
        var hasAnswerd = false;
        $scope.isDisabled = function(index){
            if (hasAnswerd) {
                if (hasIndex === index) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }

        };
        $scope.selectedAnswer = function(data, index){
            if (!hasAnswerd) {
                answer = data.artist;
                console.log(index + data);
                hasAnswerd = true;
                hasIndex = index;
                charlieProxy.answerQuestion(data, function(correct){
                   console.log("Answer correct: " + correct); 
                });
            }
        };

        $scope.retriveCursor = function() {
            if (hasAnswerd) {
                return 'selected';
            } else {
                return 'notSelected';
            }
        }

        $scope.setColor = function(index) {
          switch (index) {
              case 0: return 'green';
                      break;
              case 1: return 'red';
                      break;
              case 2: return 'blue';
                      break;
              case 3: return 'yellow';
                      break;
              default:return 'grey';
                      break;
          }
        };


        /*Test the js-fiddle here*/
        $scope.isSelected = function(data){
            return $scope.selected === data;
        };

        $scope.setAnswer2 = function(data){
            $scope.selected = data.artist;
        };
        /*-------*/

        $interval(function(){
            $scope.determinateValue--;
            if($scope.determinateValue === -1){
                charlieProxy.nextQuestion(function(data){
                    // Play song
                    audioElement.src = data.track_url + ".mp3";
                    audioElement.play();

                    $scope.possibleArtists = data.artists;
                });
                
                $scope.determinateValue = 20;
                hasAnswerd = false;
                hasIndex = '';
            }
        }, 1000, 0, true);

        /*
        * 1. Get the quiz
        * 2. Get the question
        * 3. Get the artists
        * 4. Place it in $scope.questions to repeat it.
        */

        /*
        * 1. When the time has exceeded call the next question.
        * 2. Do the same as above.
        */

    }]);

charlieController.controller('scoreboardController', [ '$scope', '$location' , 'charlieProxy',
    function($scope, $location, charlieProxy) {
        console.log("Inside scoreboardController");
        var color = ["#B9F6CA","#FFFF8D","#84FFFF", "#FF8A80" ];
        var dataArray = [];
        charlieProxy.listenTo("gameover", function(users){
           for(var i = 0; i < users.length; i++){
               var data = {
                   value : users[i].points,
                   userName: users[i].name,
                   color: color[i]
               };
               dataArray.push(data);
           }
        });
        $scope.scoreData = dataArray;
    
        var ctx = document.getElementById("scoreboardChart").getContext("2d");
        var sChart = new Chart(ctx).Doughnut();
        
        for(var i = 0; i < $scope.scoreData.length; i++){
            sChart.addData($scope.scoreData[i]);
        };
        
        $scope.changeView = function(view){
            console.log("Changing view to: " + view);
            $location.path(view); // path not hash
        };
        
        $scope.savePlaylist = function(){
            charlieProxy.savePlaylist();
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
            console.log("Submitting..." + " " + $scope.name + " " + $scope.nbrOfQuestions + " " + $scope.tags + " " + $scope.playlistSelected);
            
            // TODO generate quiz
            charlieProxy.createQuiz($scope.name, $scope.tags, $scope.playlistSelected, $scope.nbrOfQuestions, true, function(quiz){
               $location.path('/lobby'); 
            });
            
        };

    }]);