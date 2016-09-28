/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/create.css');

module.exports =
    function choosePlaylistController($scope, $state, charlieProxy) {
        console.log("Inside choosePlaylistController");

        charlieProxy.getPlaylists(function (lists) {
            $scope.playlists = lists;
        });

        $scope.choosePlaylist = function(playlist) {
            $state.go('main.create.fromPlaylist', {id: playlist.id, name: playlist.name, owner: playlist.playlistOwner});
        };
    };