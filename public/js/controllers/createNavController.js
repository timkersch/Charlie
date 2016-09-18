/**
 * Created by Tim on 11/09/16.
 */

require('../../css/partials/create.css');
const angular = require('angular');

angular.module('charlieController').controller('createNavController', ['$scope',
    function ($scope) {
        console.log("Inside createController");
        $scope.currentNavItem = 'standard';
    }]);