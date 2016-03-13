package core;

import javax.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

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
    private String imgUrl;

    public User() {
        super();
    }

    public User(com.wrapper.spotify.models.User spotifyUser) {
        this();
        this.displayName = spotifyUser.getDisplayName();
        this.email = spotifyUser.getEmail();
        this.href = spotifyUser.getExternalUrls().get("spotify");
        this.name = spotifyUser.getId();
        this.country = spotifyUser.getCountry();
        this.uri = spotifyUser.getUri();
        if(!spotifyUser.getImages().isEmpty()) {
            this.imgUrl = spotifyUser.getImages().get(0).getUrl();
        } else {
            this.imgUrl = "";
        }
    }

	public void setImgUrl(String url) {
		this.imgUrl = url;
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

    public String getImgUrl() {
            return imgUrl;
    }

    @Override
    public String toString(){
        StringBuilder sb = new StringBuilder();
        sb.append("displayname:");
        sb.append(this.displayName);
        sb.append("\n");
        sb.append("name:");
        sb.append(this.name);
        sb.append("\n");
        sb.append("email:");
        sb.append(this.email);
        sb.append("\n");
        sb.append("href:");
        sb.append(this.href);
        sb.append("\n");
        sb.append("country:");
        sb.append(this.country);
        sb.append("\n");
        sb.append("uri:");
        sb.append(this.uri);
        sb.append("\n");
        sb.append("imgUrl:");
        sb.append(this.imgUrl);
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 83 * hash + Objects.hashCode(this.name);
        return hash;
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
        final User other = (User) obj;
        if (!Objects.equals(this.name, other.name)) {
            return false;
        }
        return true;
    }
}
