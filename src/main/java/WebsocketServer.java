import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
@ServerEndpoint("/actions")
public class WebsocketServer {

    @Inject
    private SessionHandler sessionHandler;

    @OnOpen
    public void open(Session session) {
        System.out.println("Opened Session: " + session.getId());
        UserSession userSession = new UserSession(session);
        sessionHandler.addSession(userSession);
    }

    @OnClose
    public void close(Session session) {
        System.out.println("Closed Session: " + session.getId());
        sessionHandler.removeSession(sessionHandler.getUserSession(session.getId()));
    }

    @OnError
    public void onError(Throwable error) {
        System.out.println("Error: " + error.toString());
        Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, error);
    }

    @OnMessage
    public void handleMessage(String message, Session session) {
        try (JsonReader reader = Json.createReader(new StringReader(message))) {
            JsonObject jsonMessage = reader.readObject();
            String action = jsonMessage.getString("action");

            long userId;
            User user;
            switch(action) {
                case "register":
                    userId = jsonMessage.getJsonNumber("id").longValue();
                    String username = jsonMessage.getString("username");
                    user = new User(username);
                    sessionHandler.getUserSession(session.getId()).setUser(user);
                    break;
                case "login":
                    userId = jsonMessage.getJsonNumber("id").longValue();
                    user = DBContext.findUser(userId);
                    sessionHandler.getUserSession(session.getId()).setUser(user);
                    break;
                case "logout":
                    sessionHandler.getUserSession(session.getId()).setUser(User.createDummyUser());
                    break;
                case "vote":

                    break;
                case "create":
                    Long[] users = (Long[]) jsonMessage.getJsonArray("users").toArray();
                    String playlist = jsonMessage.getString("playlist");
                    int nbrOfSongs = jsonMessage.getInt("nbrOfSongs");
                    int difficulty = jsonMessage.getInt("difficulty");

                    break;
                default:
                    break;
            }
        }
    }

}