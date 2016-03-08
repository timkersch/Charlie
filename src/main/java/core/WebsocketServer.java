package core;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.wrapper.spotify.models.SimplePlaylist;
import com.wrapper.spotify.models.Track;

import javax.inject.Inject;
import javax.json.*;
import javax.json.spi.JsonProvider;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.io.StringReader;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@ServerEndpoint("/api")
public class WebsocketServer {


    @Inject
    private DB db;

    @PersistenceContext(unitName = "db")
    EntityManager em; 

    private final SpotifyService service = new SpotifyService();

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
        UserSession userSession = sessionHandler.getUserSession(session.getId());
        sessionHandler.removeSession(userSession);
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

            UserIdentity user;
            Gson gson = new Gson();
            String userAsString;
            System.out.println(action);
            switch(action) {
                case "getLoginURL":
                    String url = service.getAuthorizeURL();
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", url).build();
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "login":
                    String code = data.getString("code");
                    System.out.println("Code: " + code);
                    user = service.getUser(code);
                    db.getUserCatalogue().create(user);
                    userSession.setUserIdentity(user);
                    //userAsString = gson.toJson(user);
                    JsonElement jsonElement = gson.toJsonTree(user.getUser());
                    jsonElement.getAsJsonObject().addProperty("id", user.getId());;
                    userAsString = gson.toJson(jsonElement);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", userAsString).build();
                    System.out.println("User: " + userAsString);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "setUser":
                    Long id = data.getJsonNumber("id").longValue();
                    System.out.println("id: " + id);
                    boolean success = true;
                    user = db.getUserCatalogue().find(id);
                    if (user == null) {
                        user = UserIdentity.createDummyUser();
                        success = false;
                    }else{
                        service.setTokens(user.getAccessToken(), user.getRefreshToken());
                    }
                    userSession.setUserIdentity(user);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", success).build();
                    System.out.println("Success: " + success);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getPlaylists":
                    System.out.println("User: " + gson.toJson(userSession.getUserIdentity()));
                    List<SimplePlaylist> lists = service.getUsersPlaylists();
                    String playlists = gson.toJson(lists);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", playlists).build();
                    System.out.println("Playlists: " + playlists);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getUsers":
                    List<UserIdentity> onlineUsers = sessionHandler.getUsers();
                    String usersString = gson.toJson(onlineUsers);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", usersString).build();
                    System.out.println("Users: " + usersString);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "logout":
                    sessionHandler.getUserSession(session.getId()).setUserIdentity(UserIdentity.createDummyUser());
                    break;
                case "vote":

                    break;
                case "createQuiz":
                    Long[] userIds = (Long[]) jsonMessage.getJsonArray("users").toArray();
                    String playlistId = jsonMessage.getString("playlist");
                    int nbrOfSongs = jsonMessage.getInt("nbrOfSongs");

                    List<Track> tracks = service.getPlaylistSongs(playlistId);
                    List<Track> similarTracks = service.getSimilarTracks(tracks, nbrOfSongs);
                    List<String> similarTrackIds = new ArrayList<>();
                    for(Track track : similarTracks)
                        similarTrackIds.add(track.getId());

                    Quiz quiz = new Quiz(userSession.getUserIdentity().getId(), Arrays.asList(userIds), similarTrackIds);
                    
                    db.getQuizCatalogue().create(quiz);
                    
                    String jsonQuiz = gson.toJson(quiz);

                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", jsonQuiz).build();
                    //System.out.println("Playlists: " + playlists);
                    session.getBasicRemote().sendText(response.toString());
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