/**
 * Created by Tim on 03/09/16.
 */

require('../../css/partials/create.css');

module.exports =
    function choosePlaylistController($scope, $state, apiService) {
        console.log("Inside choosePlaylistController");

        apiService.getPlaylists(function (lists) {
            $scope.playlists = lists;
        });

        $scope.choosePlaylist = function(playlist) {
            $state.go('main.create.fromPlaylist', {id: playlist.id, name: playlist.name, owner: playlist.playlistOwner});
        };
    };