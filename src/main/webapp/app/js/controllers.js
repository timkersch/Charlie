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

charlieController.controller('lobbyController', ['$scope', '$location','$routeParams', 'charlieProxy',
    function($scope, $location, $routeParams, charlieProxy){
        console.log("LobbyController!");
        /*var quizname = charlieProxy.getQuizname();*/
        $scope.quizname = "Simpas Quiz";
        var users = [{
            name: "Simon"
        },{
            name: "Erik"
        },{
            name: "Joakim"
        },{
            name: "Tim"
            }];
        $scope.users = users;
        $scope.$on("user-joined", function(data) {
            $scope.users = [];
            $scope.users.push(data);
        });

        $scope.startQuiz = function(){
            $location.path('/question');
        }

    }]);

charlieController.controller('signupController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
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

charlieController.controller('homeController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Init");

        $scope.getPlaylists = function (){
            console.log("login");
            charlieProxy.getPlaylists(function(lists){
                $scope.playlists = lists
            });
        };

        $scope.getUsers = function(){
            console.log("getUsers");
            charlieProxy.getUsers(function(users){
                $scope.users = users;
            });
        };
    }]);

charlieController.controller('questionController', [ '$scope', '$routeParams', '$interval', 'charlieProxy',
    function($scope, $routeParams, $interval, charlieProxy) {
        console.log("Inside questionController");
        $scope.determinateValue = 20;
        var incrementer = 0;
        var answer = "";
        $scope.activated = true;
        $scope.isDisabled = false;
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
        }

        $scope.setAnswer2 = function(data){
            $scope.selected = data.artist;
        }
        /*-------*/

        $scope.selectedAnswer = function(data){
            answer = data.artist;
            $scope.isDisabled = true;
        }

        $interval(function(){
            incrementer += 1;
            if(incrementer > 9){
                incrementer = 0;
                $scope.determinateValue -= 1;
                if($scope.determinateValue === -1){
                    /*
                    * 1. Get the answer and send to the backend.
                    * 2. Get the next question
                    */
                    console.log(answer);

                    $scope.suggestions = question2;
                    $scope.determinateValue = 20;
                    $scope.isDisabled = false;
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

charlieController.controller('scoreboardController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside scoreboardController");


    }]);

charlieController.controller('profileController', [ '$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside profileController");
    }]);

charlieController.controller('createController', ['$scope', '$routeParams', 'charlieProxy',
    function($scope, $routeParams, charlieProxy) {
        console.log("Inside createController");
        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.playlistSelected = null;
        $scope.readonly = false;
        $scope.tags = [];

        charlieProxy.getPlaylists(function(lists){
            $scope.playlists = lists
        });

        $scope.submit = function() {
            console.log("Submitting..." + " " + $scope.name + " " + $scope.nbrOfQuestions + " " + $scope.tags + " " + $scope.playlistSelected)
        };

    }]);