/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/scoreboard.css');
const chartjs = require('chart.js');
const angular = require('angular');

angular.module('charlieController').controller('scoreboardController', ['$scope', '$document', '$state', 'charlieProxy',
    function ($scope, $document, $state, charlieProxy) {
        console.log("Inside scoreboardController");
        $scope.scores = [];
        $scope.isDisabled = false;
        $scope.playlistText = "Save playlist to Spotify";
        let chartColors = ["#80CBC4", "#FF8A80", "#8C9EFF", "#FFEB3B"];

        let init = function () {
            charlieProxy.getResults(function (users) {
                if (users) {
                    let chartObj = {
                        type: 'bar',
                        data: {
                            labels: [""],
                            datasets: []
                        },
                        options: {}
                    };

                    $scope.scores = [];
                    for (let i = 0; i < users.length; i++) {
                        let tmpArray = [users[i].points];
                        chartObj.data.datasets.push({
                            fillColor: chartColors[i],
                            data: tmpArray
                        });
                        $scope.scores.push({
                            value: users[i].points,
                            userName: users[i].userID,
                            color: users[i].color
                        });
                    }

                    setTimeout(function () {
                        const ctx = document.getElementById("scoreboardChart").getContext("2d");
                        new chartjs.Chart(ctx, chartObj);
                        $scope.$apply();
                    }, 50);


                }
            });
        };

        // Initialize when service is ready
        charlieProxy.onReady(function () {
            init();
        });

        $scope.changeView = function () {
            charlieProxy.leaveQuiz();
            if(charlieProxy.isLoggedIn()) {
                $state.go('main.loggedIn');
            } else {
                $state.go('main.loggedOut');
            }
        };

        $scope.savePlaylist = function () {
            charlieProxy.savePlaylist();
            $scope.isDisabled = true;
            $scope.playlistText = "Playlist added";
        };

    }]);