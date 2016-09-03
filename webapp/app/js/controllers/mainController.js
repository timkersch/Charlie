/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('mainController', ['$scope', '$routeParams', '$route', '$location', '$mdToast', 'charlieProxy', '$mdSidenav',
    function ($scope, $routeParams, $route, $location, $mdToast, charlieProxy, $mdSidenav) {
        $scope.user = '';
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

        let init = function () {
            if (charlieProxy.isLoggedIn()) {
                charlieProxy.getUser(function (user) {
                    $scope.user = user;
                });
            } else {
                if (sessionStorage.getItem('code')) {
                    charlieProxy.login(sessionStorage.getItem('code'), function (user) {
                        console.log('called back');
                        $scope.user = user;
                        $route.reload();
                    });
                } else {
                    charlieProxy.getLoginUrl(function (url) {
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

        // let showActionToast = function (quiz) {
        //     let toast = $mdToast.simple()
        //         .textContent('You have been invited to ' + quiz.name)
        //         .action('ACCEPT')
        //         .highlightAction(true)
        //         .hideDelay(10 * 1000);
        //
        //     $mdToast.show(toast).then(function (response) {
        //         if (response == 'ok') {
        //             charlieProxy.joinQuiz(quiz, function (success) {
        //                 if (success) {
        //                     $location.path('/lobby');
        //                 } else {
        //                     alert('Something went wrong joining the quiz!');
        //                 }
        //             });
        //         }
        //     });
        // };

        // charlieProxy.listenTo("invitedTo", function (quiz) {
        //     showActionToast(quiz);
        // });

        $scope.login = function () {
            window.location.href = $scope.url;
        };

        $scope.logout = function () {
            console.log('in logout');
            $scope.user = {};
            charlieProxy.logout();
            charlieProxy.getLoginUrl(function (url) {
                $scope.url = url;
            });
        };

    }]);