/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/scoreboard.css');
const chartjs = require('chart.js');

module.exports =
    function ($scope, $document, $state, socketService, apiService) {
        console.log("scoreboardController");

        $scope.scores = [];
        $scope.isDisabled = false;
        $scope.playlistText = "Save playlist to Spotify";

        apiService.getUser(function (me) {
            apiService.getResults(function (users) {
                if (users) {
                    $scope.scores = [];
                    const namesArr = [];
                    const pointsArr = [];
                    const colorsArr = [];
                    for (let i = 0; i < users.length; i++) {
                        if(users[i].userID === me.userID && users[i].savedPlaylist) {
                            $scope.isDisabled = true;
                            $scope.playlistText = "Playlist added";
                        }

                        namesArr.push(users[i].userID);
                        pointsArr.push(users[i].points);
                        colorsArr.push(colors[users[i].color]);

                        $scope.scores.push({
                            value: users[i].points,
                            userName: users[i].userID,
                            color: users[i].color
                        });
                    }

                    let chartObj = {
                        type: 'bar',
                        data: {
                            labels : namesArr,
                            datasets: [
                                {
                                    label: 'Points',
                                    backgroundColor: colorsArr,
                                    borderWidth: 1,
                                    data: pointsArr
                                }
                            ]
                        },
                        options: {
                            maintainAspectRatio: true,
                            responsive: true,
                            scales: {
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    };

                    setTimeout(function () {
                        chartjs.Chart.defaults.global.legend.display = false;
                        const ctx = document.getElementById("scoreboardChart").getContext("2d");
                        new chartjs.Chart(ctx, chartObj);
                        $scope.$apply();
                    }, 50);

                }
            });
        });

        $scope.changeView = function () {
            if (apiService.isLoggedIn()) {
                $state.go('main.loggedIn');
            } else {
                $state.go('main.loggedOut');
            }
        };

        $scope.savePlaylist = function () {
            apiService.savePlaylist();
            $scope.isDisabled = true;
            $scope.playlistText = "Playlist added";
        };

        $scope.isLoggedIn = function() {
            return apiService.isLoggedIn();
        };

        $scope.$on('$destroy', function () {
            socketService.leaveQuiz();
        });

    };

// TODO use CSS defs instead
const colors = {
    'gray-avatar' : '#f5f5f5',
    'green-avatar' : '#4CAF50',
    'orange-avatar': '#FFC107',
    'blue-avatar' : '#3F51B5',
    'red-avatar' : '#F44336',
    'purple-avatar': '#9C27B0',
    'teal-avatar': '#009688'
};
