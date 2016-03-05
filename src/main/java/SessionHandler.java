/**
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
    private int deviceId = 0;
    private final Set<UserSession> sessions = new HashSet<>();
    private final Map<String, UserIdentity> users = new HashMap<>();

    public void addSession(UserSession session) {
        sessions.add(session);
    }

    public void removeSession(UserSession session) {
        sessions.remove(session);
    }

    public void addUser(UserIdentity user){
        if (userExists(user.getUser().getUUID()))
            popUser(user.getUser().getUUID());

        users.put(user.getUser().getUUID(), user);
    }

    public UserIdentity popUser(String uuid) {
        return users.remove(uuid);
    }

    public UserIdentity getUser(String uuid) {
        return users.get(uuid);
    }

    public List<User> getUsers(){
        List<User> userList = new ArrayList<>();
        Collection<UserIdentity> userIdentities = users.values();
        for(UserIdentity userIdentity : userIdentities) {
            userList.add(userIdentity.getUser());
        }
        return userList;
    }

    public boolean userExists(String uuid) {
        return users.containsKey(uuid);
    }

    public UserSession getUserSession(String sessionId) {
        for (UserSession session : sessions) {
            if (session.getSession().getId().equals(sessionId)) {
                return session;
            }
        }
        return null;
    }

    public UserSession getUserSessionByUUID(String uuid){
        for (UserSession session : sessions) {
            System.out.println("User uuid: " + session.getUserIdentity().getUser().getUUID());
            if (session.getUserIdentity().getUser().getUUID().equals(uuid)) {
                return session;
            }
        }
        return null;
    }

    public void sendToAllConnectedSessions(JsonObject message) {
        for (UserSession session : sessions) {
            sendToSession(session, message);
        }
    }

    public void sendToSessions(Quiz quiz, JsonObject message){
        for (User user: quiz.getUsers()){
            this.sendToSession(this.getUserSession(user.getId()), message);
        }
    }

    public void sendToSession(UserSession session, JsonObject message) {
        try {
            session.getSession().getBasicRemote().sendText(message.toString());
        } catch (IOException ex) {
            sessions.remove(session);
            Logger.getLogger(SessionHandler.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @Override
    public String toString(){
        StringBuilder sb = new StringBuilder();
        for (UserSession session : sessions) {
            sb.append("SessionId: ").append(session.getSession().getId()).append(", UserUUID: ").append(session.getUserIdentity().getUser().getUUID());
        }
        return sb.toString();
    }

}
