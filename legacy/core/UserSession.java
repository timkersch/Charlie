package core;

import javax.websocket.Session;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Created by jcber on 2016-03-03.
 * A UserSession is to represent the connection between a user and its
 * session. The session is used to communicate with the client the user is
 * using. 
 */
public class UserSession {
    private UserIdentity user;
    private Session session;
    private Quiz currentQuiz;

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
    
    public Quiz getCurrentQuiz(){
        return currentQuiz;
    }
    
    public void setCurrentQuiz(Quiz quiz){
        this.currentQuiz = quiz;
    }
    
    public void send(String text) {
        try {
            this.session.getBasicRemote().sendText(text);
        } catch (IOException ex) {
            Logger.getLogger(UserSession.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
