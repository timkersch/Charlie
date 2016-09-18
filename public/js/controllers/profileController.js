/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/profile.css');

module.exports =
    function ($scope, charlieProxy) {
        console.log("Inside profileController");

        charlieProxy.getUser(function (user) {
            $scope.user = user;
        });
    };