package core;

import java.io.Serializable;

import javax.persistence.Embeddable;

/**
 * Created by jcber on 2016-03-03.
 */

@Embeddable
public class User implements Serializable { 
    private String displayName;
    private String email;
    private String href;
    private String name;
    private String country;
    private String uri;

    public User() {
        super();
    }

    public User(com.wrapper.spotify.models.User spotifyUser) {
        this();
        this.displayName = spotifyUser.getDisplayName();
        this.email = spotifyUser.getEmail();
        this.href = spotifyUser.getHref();
        this.name = spotifyUser.getId();
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

    public void setName(String name) {
        this.name = name;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setUri(String uri) {
        this.uri = uri;
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

    public String getName() {
        return name;
    }

    public String getCountry() {
        return country;
    }

    public String getUri() {
        return uri;
    }

    @Override
    public String toString(){
        return "User[name: " + name + "]";
    }
}
