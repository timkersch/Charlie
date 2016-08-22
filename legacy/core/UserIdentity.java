package core;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import persistence.AbstractEntity;

import javax.persistence.Column;
import javax.persistence.Entity;
import java.util.Objects;

/**
 * Created by jcber on 2016-03-03.
 */

@Entity
public class UserIdentity extends AbstractEntity{
    private User user;
    @Column(length=512)
    private String accessToken;
    @Column(length=512)
    private String refreshToken;

    private static final Gson GSON = new Gson();
    
    public UserIdentity() {
        super();
    }

    public UserIdentity(com.wrapper.spotify.models.User spotifyUser, String accessToken, String refreshToken) {
        this();
        this.user = new User(spotifyUser);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
    
    public void setAccessToken(String token) {
        this.accessToken = token;
    }
    
    public void setRefreshToken(String token) {
        this.refreshToken = token;
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

    /**
     * Create a dummy user to be used as a placeholder.
     * @return the user
     */
    public static UserIdentity createDummyUser(){
        UserIdentity dummy = new UserIdentity();
        dummy.user = new User();
        dummy.user.setName("dummy");
        return dummy;
    }
    
    public JsonObject toJson(){
        JsonObject obj = GSON.toJsonTree(this.getUser()).getAsJsonObject();
        obj.addProperty("id", this.getId());;
        return obj;
    }

    @Override
    public int hashCode() {
        int hash = 3;
        hash = 47 * hash + Objects.hashCode(this.user);
        return hash;
    }

    @Override
    public String toString() {
        return user.toString() + "\n" + "accessToken:" + this.accessToken + "\n" + "refreshToken" + this.refreshToken;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final UserIdentity other = (UserIdentity) obj;
        if (!Objects.equals(this.user, other.user)) {
            return false;
        }
        return true;
    }
}
