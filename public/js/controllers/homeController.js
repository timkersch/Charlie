/**
 * Created by Tim on 15/09/16.
 */


require('../../css/partials/home.css');

angular.module('charlieController').controller('homeController', ['$scope', '$state',
    function ($scope, $state) {
        $scope.changeView = function(state) {
            $state.go(state);
        }
    }]);