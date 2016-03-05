import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonValue;
import javax.json.spi.JsonProvider;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
@ServerEndpoint("/actions")
public class WebsocketServer {

    private SpotifyService service = new SpotifyService();

    @Inject
    private SessionHandler sessionHandler;

    @OnOpen
    public void open(Session session) {
        System.out.println("Opened Session: " + session.getId());
        UserSession userSession = new UserSession(session);
        userSession.setUser(User.createDummyUser());
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
            int requestId = jsonMessage.getJsonNumber("request_id").intValue();
            JsonProvider provider = JsonProvider.provider();
            JsonObject response = null;

            long userId;
            User user;
            switch(action) {
                case "getLoginURL":
                    String url = service.getAuthorizeURL();
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", url).build();
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "logout":
                    sessionHandler.getUserSession(session.getId()).setUser(User.createDummyUser());
                    break;
                case "vote":

                    break;
                case "create":
                    /*Long[] users = (Long[]) jsonMessage.getJsonArray("users").toArray();
                    String playlist = jsonMessage.getString("playlist");
                    int nbrOfSongs = jsonMessage.getInt("nbrOfSongs");
                    int difficulty = jsonMessage.getInt("difficulty");*/

                    break;
                default:
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).build();
                    sessionHandler.sendToAllConnectedSessions(response);
                    break;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}