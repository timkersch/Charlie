import com.google.gson.Gson;
import com.wrapper.spotify.models.SimplePlaylist;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.*;
import javax.json.spi.JsonProvider;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.io.StringReader;
import java.util.List;
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
            JsonObject data = jsonMessage.getJsonObject("data");
            String action = jsonMessage.getString("action");
            int requestId = jsonMessage.getJsonNumber("request_id").intValue();
            UserSession userSession = sessionHandler.getUserSession(session.getId());

            JsonProvider provider = JsonProvider.provider();
            JsonObject response;

            User user;
            Gson gson = new Gson();
            String userAsString;
            switch(action) {
                case "getLoginURL":
                    String url = service.getAuthorizeURL();
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", url).build();
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getUserByCode":
                    String code = data.getString("code");
                    System.out.println("Code: " + code);
                    user = service.getUser(code);
                    userSession.setUser(user);
                    userAsString = gson.toJson(user);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", userAsString).build();
                    System.out.println("User: " + userAsString);
                    System.out.println("Sessions: " + sessionHandler);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "setUser":
                    String uuid = data.getString("uuid");
                    System.out.println("uuid: " + uuid);
                    System.out.println("Sessions: " + sessionHandler);
                    boolean success = false;
                    if (!userSession.getUser().getUUID().equals(uuid)) {
                        // fetch user
                        UserSession otherSession = sessionHandler.getUserSessionByUUID(uuid);
                        user = otherSession.getUser();
                        userSession.setUser(user);
                        sessionHandler.removeSession(otherSession);
                        success = true;
                    }
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", success).build();
                    System.out.println("Success: " + success);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getPlaylists":
                    System.out.println("User: " + gson.toJson(userSession.getUser()));
                    List<SimplePlaylist> lists = service.getPlaylists(userSession.getUser().getId());
                    String playlists = gson.toJson(lists);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", playlists).build();
                    System.out.println("Playlists: " + playlists);
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