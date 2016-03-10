package core; /**
 * Created by jcber on 2016-03-01.
 */

import javax.enterprise.context.ApplicationScoped;
import javax.json.JsonObject;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class SessionHandler {
    private final Set<UserSession> sessions = new HashSet<>();

    public void addSession(UserSession session) {
        sessions.add(session);
    }

    public void removeSession(UserSession session) {
        sessions.remove(session);
    }
    
    public List<UserIdentity> getUsers() {
        List<UserIdentity> users = new ArrayList<>();
        for (UserSession session : sessions)
            users.add(session.getUserIdentity());
        return users;
    }

    public UserSession getUserSession(String sessionId) {
        for (UserSession session : sessions) {
            if (session.getSession().getId().equals(sessionId)) {
                return session;
            }
        }
        return null;
    }

    public UserSession getUserSessionById(Long id){
        for (UserSession session : sessions) {
            System.out.println("User uuid: " + session.getUserIdentity().getId());
            if (session.getUserIdentity().getId().equals(id)) {
                return session;
            }
        }
        return null;
    }

    public void sendToAllConnectedSessions(String message) {
        for (UserSession session : sessions) {
            sendToSession(session, message);
        }
    }

    public void sendToSessions(Quiz quiz, String message){
        for (Long user: quiz.getPlayerIds()){
            this.sendToSession(this.getUserSessionById(user), message);
        }
    }

    public void sendToSession(UserSession session, String message) {
        try {
            session.getSession().getBasicRemote().sendText(message);
        } catch (IOException ex) {
            sessions.remove(session);
            Logger.getLogger(SessionHandler.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public String toString(){
        StringBuilder sb = new StringBuilder();
        for (UserSession session : sessions) {
            sb.append("SessionId: ").append(session.getSession().getId()).append(", UserUUID: ").append(session.getUserIdentity().getId());
        }
        return sb.toString();
    }

}
