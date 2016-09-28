/**
 * Created by Tim on 17/09/16.
 */

require('../../css/partials/home.css');
const authUrl = '/auth/spotify';

module.exports =
    function ($scope) {
        console.log("Inside homeController");

        $scope.login = function () {
            window.open(authUrl, '_self');
        };
    };