/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/profile.css');
const angular = require('angular');

angular.module('charlieController').controller('profileController', ['$scope', 'charlieProxy',
    function ($scope, charlieProxy) {
        console.log("Inside profileController");

        charlieProxy.getUser(function (user) {
            $scope.user = user;
        });
    }]);