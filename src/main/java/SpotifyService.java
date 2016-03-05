import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.SettableFuture;
import com.wrapper.spotify.Api;
import com.wrapper.spotify.methods.UserPlaylistsRequest;
import com.wrapper.spotify.models.*;

import java.util.ArrayList;
import java.util.Arrays;
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
				System.out.println("Access token: " +     authorizationCodeCredentials.getAccessToken());

				/* Set the access token and refresh token so that they are used whenever needed */
				api.setAccessToken(authorizationCodeCredentials.getAccessToken());
				api.setRefreshToken(authorizationCodeCredentials.getRefreshToken());
			}

			@Override
			public void onFailure(Throwable throwable) {
				throwable.printStackTrace();
                /* Let's say that the client id is invalid, or the code has been used more than once,
		        * the request will fail. Why it fails is written in the throwable's message. */
			}
		});
	}

	public User getUser(String code) {
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

			User user = new User(currentUser);

			user.setAccessToken(accessToken);

			return new User(currentUser);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return User.createDummyUser();
	}

	public List<SimplePlaylist> getPlaylists(String displayname){
		final UserPlaylistsRequest request = api.getPlaylistsForUser(displayname).build();

		try {
			final Page<SimplePlaylist> playlistsPage = request.get();

			return playlistsPage.getItems();
		} catch (Exception e) {
			System.out.println("Something went wrong!" + e.getMessage());
		}
		return new ArrayList<>();
	}
}