/**
 * Created by Tim on 11/09/16.
 */

angular.module('charlieController').controller('createNavController', ['$scope',
    function ($scope) {
        console.log("Inside createController");
        $scope.currentNavItem = 'standard';
    }]);