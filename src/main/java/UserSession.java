import javax.websocket.Session;

/**
 * Created by jcber on 2016-03-03.
 */
public class UserSession {
    private User user;
    private Session session;

    public UserSession(Session session) {
        this.session = session;
        this.user = User.createDummyUser();
    }

    public Session getSession(){
        return session;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getUser(){
        return user;
    }
}
