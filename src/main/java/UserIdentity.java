import java.util.UUID;

/**
 * Created by jcber on 2016-03-03.
 */

public class UserIdentity {
    private User user;
    private String accessToken;
    private String refreshToken;

    private UserIdentity() {}

    public UserIdentity(com.wrapper.spotify.models.User spotifyUser, String accessToken, String refreshToken) {
        this.user = new User(spotifyUser);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public User getUser(){
        return user;
    }

    public static UserIdentity createDummyUser(){
        UserIdentity dummy = new UserIdentity();
        dummy.user = User.createDummyUser();
        return dummy;
    }
}
