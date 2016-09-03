/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('createController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Inside createController");
        $scope.name = null;
        $scope.nbrOfQuestions = "";
        $scope.playlistSelected = null;
        $scope.readonly = false;
        $scope.tags = [];
        $scope.toggleSwitch = true;
        $scope.loading = false;

        let init = function () {
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