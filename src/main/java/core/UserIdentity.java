package core;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import persistence.AbstractEntity;

import javax.persistence.*;

/**
 * Created by jcber on 2016-03-03.
 */

@Entity
public class UserIdentity extends AbstractEntity{
    private User user;
    private String accessToken;
    private String refreshToken;

    public UserIdentity() {
        super();
    }

    public UserIdentity(com.wrapper.spotify.models.User spotifyUser, String accessToken, String refreshToken) {
        this();
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

    @Override
    public String toString(){
        return "User[" + super.toString() + ", accessToken: " + accessToken + ", refreshToken: " + refreshToken + "]";
    }

    public static UserIdentity createDummyUser(){
        UserIdentity dummy = new UserIdentity();
        dummy.user = new User();
        dummy.user.setName("dummy");
        return dummy;
    }
    
    public JsonElement toJsonElement(){
        Gson gson = new Gson();
        JsonElement element = gson.toJsonTree(this.getUser());
        element.getAsJsonObject().addProperty("id", this.getId());;
        return element;
    }
}
