import com.google.appengine.repackaged.com.google.common.base.Flag;
import com.google.common.primitives.Booleans;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.SettableFuture;
import com.wrapper.spotify.Api;
import com.wrapper.spotify.exceptions.WebApiException;
import com.wrapper.spotify.methods.*;
import com.wrapper.spotify.models.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.List;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-03
 * Time: 18:42
 */

public class SpotifyService {
	private final Api api = Api.builder()
			.clientId(SpotifyCredentials.clientID)
			.clientSecret(SpotifyCredentials.clientSecret)
			.redirectURI(SpotifyCredentials.redirectURI)
			.build();

	/* Continue by sending the user to the authorizeURL, which will look something like
	https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
	*/
	public String getAuthorizeURL() {
		/* Set the necessary scopes that the application will need from the user */
		List<String> scopes = Arrays.asList("user-read-private", "user-read-email");

		/* Set a state. This is used to prevent cross site request forgeries. */
		String state = "someExpectedStateString";

		return api.createAuthorizeURL(scopes, state);
	}

	public void setTokens(String code) {
		/* Make a token request. Asynchronous requests are made with the .getAsync method and synchronous requests
        * are made with the .get method. This holds for all type of requests. */
		final SettableFuture<AuthorizationCodeCredentials> authorizationCodeCredentialsFuture = api.authorizationCodeGrant(code).build().getAsync();

		/* Add callbacks to handle success and failure */
		Futures.addCallback(authorizationCodeCredentialsFuture, new FutureCallback<AuthorizationCodeCredentials>() {
			@Override
			public void onSuccess(AuthorizationCodeCredentials authorizationCodeCredentials) {
                /* The tokens were retrieved successfully! */
				System.out.println("Successfully retrieved an access token! " + authorizationCodeCredentials.getAccessToken());
				System.out.println("The access token expires in " + authorizationCodeCredentials.getExpiresIn() + " seconds");
				System.out.println("Luckily, I can refresh it using this refresh token! " +     authorizationCodeCredentials.getRefreshToken());

				/* Set the access token and refresh token so that they are used whenever needed */
				api.setAccessToken(authorizationCodeCredentials.getAccessToken());
				api.setRefreshToken(authorizationCodeCredentials.getRefreshToken());
			}

			@Override
			public void onFailure(Throwable throwable) {
				System.out.println("Fail");
                /* Let's say that the client id is invalid, or the code has been used more than once,
		        * the request will fail. Why it fails is written in the throwable's message. */
			}
		});
	}

	/**
	 * Method that gathers and returns all playlists of the logged in user.
	 * @return a list of SimplePlaylist
	 */
	public List<SimplePlaylist> getUsersPlaylists() {
		try {
			UserPlaylistsRequest request = api.getPlaylistsForUser(api.getMe().build().get().getId()).build();
			Page<SimplePlaylist> playlistsPage = request.get();

			return playlistsPage.getItems();

		} catch (Exception e) {
			System.out.println("Something went wrong!" + e.getMessage());
			return null;
		}
	}

	/**
	 * Method that returns all songs in a playlist
	 * @param simplePlaylist a SimplePlaylist
	 * @return List of Track in the playlist
	 */
	public List<Track> getPlaylistSongs(SimplePlaylist simplePlaylist) {
		try {
			PlaylistTracksRequest request = api.getPlaylistTracks(api.getMe().build().get().getId(), simplePlaylist.getId()).build();

			List<PlaylistTrack> playlistTracks = request.get().getItems();
			List<Track> tracks = new ArrayList<>(playlistTracks.size());
			for (PlaylistTrack pt : playlistTracks) {
				tracks.add(pt.getTrack());
			}

			return tracks;

		} catch (Exception e) {
			System.out.println("Something went wrong!" + e.getMessage());
			return null;
		}
	}

	/**
	 * Mathod that adds a list of tracks to a playlist
	 * @param tracks a list of trackURIs
	 * @param playlistId the id of the playlist
	 */
	public void addTracksToPlayList(List<String> tracks, String playlistId) {
		try {
			AddTrackToPlaylistRequest request = api.addTracksToPlaylist(api.getMe().build().get().getId(), playlistId, tracks).build();
			request.get();
		} catch (Exception e) {
			System.out.println("Something went wrong!" + e.getMessage());
		}
	}

	/**
	 * Method that creates a playlist and returns it
	 * @return a new Playlist
	 */
	public Playlist createQuizPlaylist() {
		try {
			PlaylistCreationRequest request = api.createPlaylist(api.getMe().build().get().getId(), "quiz" + this.hashCode())
					.publicAccess(false)
					.build();

			Playlist playlist = request.get();

			System.out.println("You just created this playlist!");
			System.out.println("Its title is " + playlist.getName());

			return playlist;
		} catch (Exception e) {
			System.out.println("Something went wrong!" + e.getMessage());
			return null;
		}
	}

	/**
	 * Method that returns four artist options for a track.
	 * @param t the Track
	 * @return a hashtable with artists as keys and boolans as values
	 */
	public Hashtable<String, Boolean> getArtistOptions(Track t) {
		List<SimpleArtist> artists = t.getArtists();
		RelatedArtistsRequest request = api.getArtistRelatedArtists(artists.get(0).getId()).build();
		try {
			Hashtable<String, Boolean> ht = new Hashtable<>();
			ht.put(t.getArtists().get(0).getName(), true);
			for (Artist a : request.get()) {
				ht.put(a.getName(), false);
			}
			return ht;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public List<Track> getSimilarTracks(List<Track> tracks, int noTracks) {
		// TODO
		return null;
	}

}