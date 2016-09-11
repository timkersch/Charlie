/**
 * Created by Tim on 11/09/16.
 */

/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('createNavigationController', ['$scope', '$location', 'charlieProxy',
    function ($scope, $location, charlieProxy) {
        console.log("Inside createController");
        $scope.currentNavItem = 'standard';
    }]);