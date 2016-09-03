/**
 * Created by Tim on 03/09/16.
 */

angular.module('charlieController').controller('profileController', ['$scope', 'charlieProxy',
    function ($scope, charlieProxy) {
        console.log("Inside profileController");

        charlieProxy.getUser(function (user) {
            $scope.user = user;
            console.log(user);
        });

    }]);