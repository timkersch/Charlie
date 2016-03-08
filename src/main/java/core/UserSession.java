package core;

import javax.websocket.Session;

/**
 * Created by jcber on 2016-03-03.
 */
public class UserSession {
    private UserIdentity user;
    private Session session;

    public UserSession(Session session) {
        this.session = session;
        this.user = UserIdentity.createDummyUser();
    }

    public Session getSession(){
        return session;
    }

    public void setUserIdentity(UserIdentity user) {
        this.user = user;
    }

    public UserIdentity getUserIdentity(){
        return user;
    }
}
