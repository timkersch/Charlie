'use strict';

var charlieController = angular.module('charlieController', [
    'ngRoute',
    'charlieService',
    'ngMaterial'
]);

charlieController.controller('mainController', ['$scope', '$location', '$routeParams', 'charlieProxy', '$mdSidenav',
    function($scope, $location, $routeParams, charlieProxy, $mdSidenav) {
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
                console.log("Not logged in");
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

charlieController.controller('lobbyController', ['$scope', '$location', '$mdToast', '$routeParams', 'charlieProxy',
    function($scope, $location, $mdToast, $routeParams, charlieProxy){
        console.log("LobbyController!");
        $scope.status = '  ';

        /*var quizname = charlieProxy.getQuizname();*/
        //TODO add name
        $scope.quizname = "Simpas Quiz";
    
        $scope.users = [];
        charlieProxy.listenTo(userJoined, function(user){
            $scope.users.push(user.name);
        });
            

        $scope.startQuiz = function(){
            $location.path('/question');
        }
        
        $scope.showActionToast = function() {
            var toast = $mdToast.simple()
            .textContent('You are invited to a quiz')
            .action('ACCEPT')
            .highlightAction(true)
            $mdToast.show(toast).then(function(response) {
                console.log("The toast: " + toast); 
                if ( response == 'ok' ) {
                    alert('You accepted the \'ACCEPT\' invite.');
                }
            });
        };
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
        console.log("Init");

      $scope.changeView = function(view){
            console.log("Changing view to: " + view);
            $location.path(view); // path not hash
        };
    }]);

charlieController.controller('questionController', [ '$scope', '$location', '$interval', 'charlieProxy',
    function($scope, $location, $interval, charlieProxy) {
        console.log("Inside questionController");
        $scope.determinateValue = 20;
        var incrementer = 0;
        
        var quiz = charlieProxy.getQuiz();
        charlieProxy.nextQuestion(function(data){
           $scope.currentTrack = data.track_url; 
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
                console.log(index);
                hasAnswerd = true;
                hasIndex = index;
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

        var question1 = [{
                artist: "The killers"
            },
            {
                artist: "Gavin Degraw"
            },
            {
                artist: "The sons of Erik"
            },
            {
                artist: "Army of Bertssons"
            }];

        var question2 = [{
            artist: "The Beatles"
        },
            {
                artist: "Darin"
            },
            {
                artist: "Lill Lindfors"
            },
            {
                artist: "Muse"
            }];

        $scope.suggestions = question1;

        /*Test the js-fiddle here*/
        $scope.isSelected = function(data){
            return $scope.selected === data;
        };

        $scope.setAnswer2 = function(data){
            $scope.selected = data.artist;
        };
        /*-------*/

        $interval(function(){
            incrementer += 1;
            if(incrementer > 9){
                incrementer = 0;
                $scope.determinateValue -= 1;
                if($scope.determinateValue === -1){
                    questionNumber += 1;
                    console.log("questionnumber: " + questionNumber);
                    if(questionNumber > 2){
                         $location.path('/scoreboard');
                     }
                    /*
                    * 1. Get the answer and send to the backend.
                    * 2. Get the next question
                    */
                    console.log(answer);

                    $scope.suggestions = question2;
                    $scope.determinateValue = 20;
                    hasAnswerd = false;
                    hasIndex = '';
                }
            }
        }, 100, 0, true);

        $scope.$on('newQuestion', function(){
           charlieProxy.getCurrentQuestion();

        });

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

charlieController.controller('scoreboardController', [ '$scope', 'charlieProxy',
    function($scope, charlieProxy) {
        console.log("Inside scoreboardController");
        $scope.scoreData = [
    {
        value: 5,
        userName: "simon",
        color: "#F7464A",
        highlight: "#FF5A5E"
    },
    {
        value: 4,
        userName: "erik",
        color: "#46BFBD",
        highlight: "#5AD3D1"
    },
    {
        value: 3,
        userName: "tim",
        color: "#FDB45C",
        highlight: "#FFC870"
    }
];


        var ctx = document.getElementById("scoreboardChart").getContext("2d");
        var sChart = new Chart(ctx).Doughnut();
        
        for(var i = 0; i < $scope.scoreData.length; i++){
            sChart.addData($scope.scoreData[i]);
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
            
            charlieProxy.createQuiz($scope.name, $scope.tags, $scope.playlistSelected, $scope.nbrOfQuestions, function(quiz){
               $location.path('/lobby'); 
            });
            
        };

    }]);