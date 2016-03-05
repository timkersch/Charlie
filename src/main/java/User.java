import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import java.util.*;

/**
 * Created by jcber on 2016-03-03.
 */

public class User {
    private String uuid;
    private String displayName;
    private String email;
    private String href;
    private String id;
    private String country;
    private String uri;
    private String accessToken;

    public User() {
        this.uuid = UUID.randomUUID().toString();
    }

    public User(com.wrapper.spotify.models.User spotifyUser) {
        this.uuid = UUID.randomUUID().toString();
        this.displayName = spotifyUser.getDisplayName();
        this.email = spotifyUser.getEmail();
        this.href = spotifyUser.getHref();
        this.id = spotifyUser.getId();
        this.country = spotifyUser.getCountry();
        this.uri = spotifyUser.getUri();
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setHref(String href) {
        this.href = href;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getUUID() {
        return uuid;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public String getHref() {
        return href;
    }

    public String getId() {
        return id;
    }

    public String getCountry() {
        return country;
    }

    public String getUri() {
        return uri;
    }

    public static User createDummyUser(){
        User dummy = new User();
        dummy.id = "dummy";
        return dummy;
    }
}
