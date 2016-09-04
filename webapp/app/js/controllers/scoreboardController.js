/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('scoreboardController', ['$scope', '$document', '$location', 'charlieProxy',
    function ($scope, $document, $location, charlieProxy) {
        console.log("Inside scoreboardController");
        $scope.scores = [];
        let canvasChart = $document[0].createElement('canvas');
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
        let chartColors = ["#80CBC4", "#FF8A80", "#8C9EFF", "#FFEB3B"];
        let classColors = ['green-text', 'red-text', 'blue-text', 'yellow-text'];

        let init = function () {
            canvasChart.id = "scoreboardChart";
            canvasChart.width = "200";
            canvasChart.height = "200";
            canvasChart.style = "margin-top: 20px;";
            let scoreboardCenter = document.getElementById("centerScoreboard");
            charlieProxy.getResults(function (users) {
                if (users) {
                    let data = {
                        labels: [""],
                        datasets: []
                    };


                    $scope.scores = [];
                    $scope.chart.values = [];
                    $scope.chart.labels = [];
                    for (let i = 0; i < users.length; i++) {
                        /*Chart.js need to read data as an array*/
                        let tmpArray = [users[i].points];
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

                    setTimeout(function () {
                        scoreboardCenter.insertBefore(canvasChart, scoreboardCenter.firstChild);
                        let context = canvasChart.getContext("2d");
                        let scoreboardChart = new Chart(context).Bar(data);
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
            charlieProxy.leaveQuiz();
            $location.path(view);
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