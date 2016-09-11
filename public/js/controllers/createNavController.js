/**
 * Created by Tim on 11/09/16.
 */

angular.module('charlieController').controller('createNavController', ['$scope', '$state',
    function ($scope, $state) {
        console.log("Inside createController");
        $scope.currentNavItem = 'standard';
    }]);