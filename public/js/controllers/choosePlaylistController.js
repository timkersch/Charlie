/**
 * Created by Tim on 03/09/16.
 */

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
            $state.go('create.fromPlaylist', {id: playlist.id, owner: playlist.playlistOwner});
        };

    }]);