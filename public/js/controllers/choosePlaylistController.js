/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/create.css');
const angular = require('angular');

angular.module('charlieController').controller('choosePlaylistController', ['$scope', '$state', 'charlieProxy',
    function ($scope, $state, charlieProxy) {
        console.log("Inside choosePlaylistController");

        let init = function () {
            charlieProxy.getPlaylists(function (lists) {
                $scope.playlists = lists;
            });
        };

        charlieProxy.onReady(function () {
            init();
        });

        $scope.choosePlaylist = function(playlist) {
            console.log(playlist.name);
            $state.go('main.create.fromPlaylist', {id: playlist.id, name: playlist.name, owner: playlist.playlistOwner});
        };

    }]);