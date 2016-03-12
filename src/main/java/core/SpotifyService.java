package core;

import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.SettableFuture;
import com.wrapper.spotify.Api;
import com.wrapper.spotify.exceptions.WebApiException;
import com.wrapper.spotify.methods.AddTrackToPlaylistRequest;
import com.wrapper.spotify.methods.PlaylistCreationRequest;
import com.wrapper.spotify.methods.PlaylistTracksRequest;
import com.wrapper.spotify.methods.UserPlaylistsRequest;
import com.wrapper.spotify.methods.authentication.ClientCredentialsGrantRequest;
import com.wrapper.spotify.models.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

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

	public void initTests() {
		final ClientCredentialsGrantRequest reqTest = api.clientCredentialsGrant().build();
		final SettableFuture<ClientCredentials> responseFuture = reqTest.getAsync();
		/* Add callbacks to handle success and failure */
		Futures.addCallback(responseFuture, new FutureCallback<ClientCredentials>() {
			@Override
			public void onSuccess(ClientCredentials clientCredentials) {
                /* The tokens were retrieved successfully! */
				System.out.println("Successfully retrieved an access token! " + clientCredentials.getAccessToken());
				System.out.println("The access token expires in " + clientCredentials.getExpiresIn() + " seconds");

                /* Set access token on the Api object so that it's used going forward */
				api.setAccessToken(clientCredentials.getAccessToken());

            /* Please note that this flow does not return a refresh token.
            * That's only for the Authorization code flow */
			}

			@Override
			public void onFailure(Throwable throwable) {
            /* An error occurred while getting the access token. This is probably caused by the client id or
            * client secret is invalid. */
			}
		});
	}


	public String getAuthorizeURL() {
		List<String> scopes = new ArrayList<>();
		scopes.add("playlist-read-private");
		scopes.add("playlist-read-collaborative");
		scopes.add("playlist-modify-private");
		scopes.add("playlist-modify-public");
		scopes.add("user-read-email");
		scopes.add("user-read-private");

		String state = "someState";

		return api.createAuthorizeURL(scopes, state);
	}

	public UserIdentity getUser(String code) {
		try {
			System.out.println("Getting user");

			/* Retrieve an access token */
			final AuthorizationCodeCredentials authorizationCodeCredentials = api.authorizationCodeGrant(code).build().get();
			System.out.println("AuthCred: " + authorizationCodeCredentials.toString());

			/* Set the access token and refresh token so that they are used whenever needed */
			api.setAccessToken(authorizationCodeCredentials.getAccessToken());
			api.setRefreshToken(authorizationCodeCredentials.getRefreshToken());

			/* The token response contains a refresh token, an accesstoken, and some other things.
			* We only need the access token to retrieve the user's information.
			*/
			final String accessToken = authorizationCodeCredentials.getAccessToken();
			final String refreshToken = authorizationCodeCredentials.getRefreshToken();
			System.out.println("AccessToken: " + accessToken);

			/* Retrieve information about the user.
			* The amount of information that is set on the User object depends on the scopes that
			* the user has allowed the application to read.
			* Read about which scopes that are available on
			* https://developer.spotify.com/spotify-web-api/get-users-profile/
			*/
			final com.wrapper.spotify.models.User currentUser = api.getMe().accessToken(accessToken).build().get();

			/* Use the information about the user */
			System.out.println("URI to currently logged in user is: " + currentUser.getUri());
			System.out.println("The currently logged in user comes from: " + currentUser.getCountry());
			System.out.println("You can reach this user at: " + currentUser.getEmail());
			System.out.println("Users display name: " + currentUser.getDisplayName());

			return new UserIdentity(currentUser, accessToken, refreshToken);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return UserIdentity.createDummyUser();
	}

	public String refreshAccessToken(String refreshToken){
		try {
			api.setRefreshToken(refreshToken);
			return api.refreshAccessToken().refreshToken(refreshToken).build().get().getAccessToken();
		} catch (IOException | WebApiException ex) {
			Logger.getLogger(SpotifyService.class.getName()).log(Level.SEVERE, null, ex);
		}
		return null;
	}

	public void setTokens(String access, String refresh){
		api.setRefreshToken(refresh);
		api.setAccessToken(access);
	}

	/**
	 * Method that gathers and returns all playlists of a specified user
	 * @return a list of SimplePlaylist
	 */
	public List<SimplePlaylist> getUsersPlaylists(String userId) {
		try {
			UserPlaylistsRequest request = api.getPlaylistsForUser(userId).build();
			Page<SimplePlaylist> playlistsPage = request.get();

			return playlistsPage.getItems();

		} catch (Exception e) {
			System.out.println("Something went wrong in getUsersPlaylists!" + e.getMessage());
			return null;
		}
	}

	/**
	 * Method that gathers and returns all playlists of the logged in user.
	 * @return a list of SimplePlaylist
	 */
	public List<SimplePlaylist> getUsersPlaylists() {
		try {
			return getUsersPlaylists(api.getMe().build().get().getId());
		} catch (Exception e) {
			System.out.println("Something went wring in getUsersPlaylists!" + e.getMessage());
			return null;
		}
	}

	/**
	 * Method that returns all songs in a playlist
	 * @param playlistId a playlist id
	 * @return List of Track in the playlist
	 */
	public List<Track> getPlaylistSongs(String playlistId, String ownerId) {
		try {
			PlaylistTracksRequest request = api.getPlaylistTracks(ownerId, playlistId).build();
			List<PlaylistTrack> playlistTracks = request.get().getItems();
			List<Track> tracks = new ArrayList<>(playlistTracks.size());
			for (PlaylistTrack pt : playlistTracks) {
				tracks.add(pt.getTrack());
			}
			return tracks;

		} catch (Exception e) {
			System.out.println("Something went wrong in getPlaylistSongs!" + e.getMessage());
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
			List<String> trackUris = new ArrayList<>(tracks.size());
			for (String track : tracks) {
				trackUris.add(api.getTrack(track).build().get().getUri());
			}
			AddTrackToPlaylistRequest request = api.addTracksToPlaylist(api.getMe().build().get().getId(), playlistId, trackUris).build();
			request.get();
		} catch (Exception e) {
			System.out.println("Something went wrong in addTracksToPlayList!" + e.getMessage());
		}
	}


	/**
	 * Method that creates and populates a playlist
	 * @param trackids tracks to populate the list with
	 * @param name the name of the playlist
	 */
	public void createAndPopulatePlaylist(List<String> trackids, String name) {
		Playlist p = this.createPlaylist(name);
		this.addTracksToPlayList(trackids, p.getId());
	}

	/**
	 * Method that creates a playlist and returns it
	 * @return a new Playlist
	 */
	public Playlist createPlaylist(String name) {
		try {
			PlaylistCreationRequest request = api.createPlaylist(api.getMe().build().get().getId(), name)
					.publicAccess(false)
					.build();

			Playlist playlist = request.get();

			System.out.println("You just created this playlist!");
			System.out.println("Its title is " + playlist.getName());

			return playlist;
		} catch (Exception e) {
			System.out.println("Something went wrong in createPlaylist!" + e.getMessage());
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
		try {
			List<Artist> relatedArtists = api.getArtistRelatedArtists(artists.get(0).getId()).build().get();
			Hashtable<String, Boolean> ht = new Hashtable<>();
			ht.put(artists.get(0).getName(), true);

			for (int i = 0; i < 3; i++) {
				ht.put(relatedArtists.get(i).getName(), false);
			}

			return ht;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * Method that returns four artist options for a track.
	 * @param trackId the trackId
	 * @return a hashtable with the artists as keys and booleans as values
	 */
	public Hashtable<String, Boolean> getArtistOptions(String trackId) {
		try {
			api.getTrack(trackId);
			return getArtistOptions(api.getTrack(trackId).build().get());
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * Method that returns a list of similar tracks based on the tracks specified
	 * @param tracks the tracks to find similar tracks from
	 * @param noTracks how many tracks to return
	 * @return a list of tracks similar to the tracks given as parameter.
	 */
	public List<Track> getSimilarTracks(List<Track> tracks, int noTracks) {
		List<Track> chosenTracks = new ArrayList<>(noTracks);
		for(int i = 0; i < noTracks; i++) {
			int randTrack = randomInt(0, tracks.size()-1);
			int rand = randomInt(0, 1);
			Track t = tracks.get(randTrack);
			if (rand == 0) {
				try {
					List<Artist> relart = api.getArtistRelatedArtists(t.getArtists().get(0).getId()).build().get();
					Track track;
					do {
						Artist a = relart.get(randomInt(0,relart.size()-1));
						List<Track> popularTracks = api.getTopTracksForArtist(a.getId(), api.getMe().build().get().getCountry()).build().get();
						track = popularTracks.get(randomInt(0, popularTracks.size()-1));
					} while(chosenTracks.contains(track) && track.getPreviewUrl().equals("null"));
					chosenTracks.add(track);
				} catch (Exception e) {
					e.printStackTrace();
				}
			} else {
				try {
					SimpleAlbum album = t.getAlbum();
					try {
						Album a = api.getAlbum(album.getId()).build().get();
						List<SimpleTrack> strack = a.getTracks().getItems();
						Track tt;
						do {
							SimpleTrack st = strack.get(randomInt(0, strack.size()-1));
							tt = api.getTrack(st.getId()).build().get();
						} while(chosenTracks.contains(tt) && tt.getPreviewUrl().equals("null"));
						chosenTracks.add(tt);
					} catch (Exception e) {
						e.printStackTrace();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return chosenTracks;
	}

	/**
	 * Returns the primary artist of a track
	 * @param trackId the track
	 * @return a SimpleArtist
	 */
	public SimpleArtist getTracksArtist(String trackId) {
		try {
			return api.getTrack(trackId).build().get().getArtists().get(0);
		} catch (Exception e) {
			System.out.println("Something went wrong in getTracksArtist" + e);
			return null;
		}
	}

	/**
	 * Helper method that generates a random number within a range
	 * @param min the minimum number in the range (inclusive)
	 * @param max the maximum number in the range (inclusive)
	 * @return a ranom integer
	 */
	private int randomInt(int min, int max) {
		Random random = new Random();
		return random.nextInt(max - min + 1) + min;
	}

	/** Return the url to a preview of a track
	 * @param t the track
	 * @return a String with the url
	 */
	public String getTrackUrl(Track t) {
		return t.getPreviewUrl();
	}

	/**
	 * Return the url to a preview of a track
	 * @param trackId the trackId
	 * @return a String with the url
	 */
	public String getTrackUrl(String trackId) {
		try {
			Track t = api.getTrack(trackId).build().get();
			return t.getPreviewUrl();
		} catch(Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
