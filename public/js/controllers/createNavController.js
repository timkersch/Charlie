/**
 * Created by Tim on 11/09/16.
 */

require('../../css/partials/create.css');

module.exports =
    function ($scope, $location) {
        console.log("Inside createController");

        const currentPath = $location.$$path;
        const regexp = /\/create\/([a-z]*)/;
        const navItem = regexp.exec(currentPath);
        $scope.currentNavItem = navItem[1];
    };