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
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import util.LocalSongsException;

import java.io.IOException;
import java.util.*;
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

	/**
	 * This method is only used for initialization when testing
	 * DO NOT CALL THIS METHOD
	 */
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


	/**
	 * Returns an autorization URL needed to send to the user
	 * @return a String that is the URL
	 */
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

	/**
	 * Returns a UserIdentity from a autorization code provided by the user
	 * @param code the code that is recived from the autorization URL
	 * @return a UserIdentity that is the signed-in user
	 */
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

	/**
	 * Returns and a new acesstoken from the refreshToken
	 * @param refreshToken the refreshtoken needed to get a new accesstoken
	 * @return a new accesstoken
	 */
	public String refreshAccessToken(String refreshToken){
		try {
			api.setRefreshToken(refreshToken);
			return api.refreshAccessToken().refreshToken(refreshToken).build().get().getAccessToken();
		} catch (IOException | WebApiException ex) {
			Logger.getLogger(SpotifyService.class.getName()).log(Level.SEVERE, null, ex);
		}
		return null;
	}

	/**
	 * Method to set acess and refresh tokens
	 * @param access the acesstoken
	 * @param refresh the refreshtoken
	 */
	public void setTokens(String access, String refresh){
		api.setRefreshToken(refresh);
		api.setAccessToken(access);
	}

	/**
	 * Method that gathers and returns all playlists of a specified user
	 * @return a list of SimplePlaylist
	 */
	public List<SimplePlaylist> getUsersPlaylists(String userId) {
		final UserPlaylistsRequest request = api.getPlaylistsForUser(userId).limit(50).build();
		try {
			final Page<SimplePlaylist> page = request.get();
			return page.getItems();
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
	public List<Track> getPlaylistSongs(String playlistId, String ownerId) throws LocalSongsException {
		try {
			PlaylistTracksRequest request = api.getPlaylistTracks(ownerId, playlistId).build();
			List<PlaylistTrack> playlistTracks = request.get().getItems();
			List<Track> tracks = new ArrayList<>(playlistTracks.size());
			for (PlaylistTrack pt : playlistTracks) {
				if (SpotifyEntityType.TRACK == pt.getTrack().getType()) {
					tracks.add(pt.getTrack());
				}
			}
			return tracks;

		} catch (Exception e) {
			System.out.println("Something went wrong in getPlaylistSongs!" + e.getMessage());
			if (e.getMessage().equals("No enum constant com.wrapper.spotify.models.AlbumType.NULL")) {
				// This is a known error in the Spotify wrapper, nothing to do until
				// they give a new release in maven...
				throw new LocalSongsException("Local songs in the playlist selected");
			}
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
	 * @return a hashtable with artists as keys and boolans as values.
	 * returns null if there are less than 3 similar artists.
	 */
	public Hashtable<String, Boolean> getArtistOptions(Track t) {
		List<SimpleArtist> artists = t.getArtists();
		try {
			List<Artist> relatedArtists = api.getArtistRelatedArtists(artists.get(0).getId()).build().get();
			Hashtable<String, Boolean> ht = new Hashtable<>();
			ht.put(artists.get(0).getName(), true);

			if (relatedArtists.size() >= 3) {
				for (int i = 0; i < 3; i++) {
					ht.put(relatedArtists.get(i).getName(), false);
				}
			} else {
				return null;
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
	 * @param countryCode the country to look for popular tracks in
	 * @return a list of tracks similar to the tracks given as parameter.
	 */
	public List<Track> getSimilarTracks(List<Track> tracks, int noTracks, String countryCode) {
		List<Track> chosenTracks = new ArrayList<>(noTracks);

		int i = 0;
		while (i < noTracks) {
			// Choose a track randomly
			int randInt = randomInt(0, tracks.size() - 1);
			Track randomTrack = tracks.get(randInt);

			try {
				// Get tracks from popular tracks of related artists
				if (randInt % 2 == 0) {
					Track track = trackFromRelatedArtist(randomTrack, chosenTracks, countryCode);
					if (track != null) {
						chosenTracks.add(track);
						i++;
					}

				// Get tracks from songs on the same album
				} else {
					Track track = trackFromAlbum(randomTrack, chosenTracks);
					if (track != null) {
						chosenTracks.add(track);
						i++;
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return chosenTracks;
	}

	// This method generates a track from related artists, if possible
	private Track trackFromRelatedArtist(Track randomTrack, List<Track> chosenTracks, String countryCode) throws Exception {
		HttpClient client = new HttpClient();
		List<Artist> relatedArtists = api.getArtistRelatedArtists(randomTrack.getArtists().get(0).getId()).build().get();
		Collections.shuffle(relatedArtists);
		for(Artist artist : relatedArtists) {
			List<Track> popularTracks = api.getTopTracksForArtist(artist.getId(), countryCode).build().get();
			Collections.shuffle(popularTracks);
			for (Track track : popularTracks) {
				GetMethod getter = new GetMethod(track.getPreviewUrl());
				if (!track.getPreviewUrl().equals("null") && client.executeMethod(getter) == HttpStatus.SC_OK && !chosenTracks.contains(track)) {
					return track;
				}
			}
		}
		return null;
	}

	// This method generates a track from the same album, if possible
	private Track trackFromAlbum(Track randomTrack, List<Track> chosenTracks) throws Exception {
		HttpClient client = new HttpClient();
		SimpleAlbum simpleAlbum = randomTrack.getAlbum();
		Album album = api.getAlbum(simpleAlbum.getId()).build().get();
		List<SimpleTrack> albumsTracks = album.getTracks().getItems();
		Collections.shuffle(albumsTracks);
		for (SimpleTrack strack : albumsTracks) {
			Track track = api.getTrack(strack.getId()).build().get();
			GetMethod getter = new GetMethod(track.getPreviewUrl());
			if (!track.getPreviewUrl().equals("null") && client.executeMethod(getter) == HttpStatus.SC_OK && !chosenTracks.contains(track)) {
				return track;
			}
		}
		return null;
	}

	/**
	 * Method that returns a list of similar tracks based on the tracks specified
	 * @param tracks the tracks to find similar tracks from
	 * @param noTracks how many tracks to return
	 * @return a list of tracks similar to the tracks given as parameter.
	 */
	public List<Track> getSimilarTracks(List<Track> tracks, int noTracks) {
		try {
			return getSimilarTracks(tracks, noTracks, api.getMe().build().get().getCountry());
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
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
	 * Method that returns a track form a trackId
	 * @param trackId the trackid
	 * @return a Track
	 */
	public Track getTrack(String trackId) {
		try {
			return api.getTrack(trackId).build().get();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * Method that returns a list of tracks from a collection of trackIds
	 * @param trackIds the trackis
	 * @return a List of tracks
	 */
	public List<Track> getTracks(String... trackIds) {
		List<Track> tracks = new ArrayList<>();
		for (String s : trackIds) {
			tracks.add(getTrack(s));
		}
		return tracks;
	}

	/**
	 * Helper method that generates a random number within a range
	 * @param min the minimum number in the range (inclusive)
	 * @param max the maximum number in the range (inclusive)
	 * @return a ranom integer
	 */
	protected int randomInt(int min, int max) {
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
