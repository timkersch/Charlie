/**
 * Created by Tim on 10/09/16.
 */

angular.module('charlieController').controller('createNavigationController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        $scope.currentNavItem = 'standard';
        console.log("Inside createNavigationController");
    }]);