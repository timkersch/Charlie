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
            // Extract the action, requestId and data from the json message
            JsonObject jsonMessage = reader.readObject();
            JsonObject data = jsonMessage.getJsonObject("data");
            String action = jsonMessage.getString("action");
            int requestId = jsonMessage.getJsonNumber("request_id").intValue();
            
            // Get the user session attached to this session
            UserSession userSession = sessionHandler.getUserSession(session.getId());

            // Create objects needed by action
            JsonProvider provider = JsonProvider.provider();
            JsonObject response;
            UserIdentity user;
            Gson gson = new Gson();
            
            System.out.println(action);
            switch(action) {
                case "getLoginURL":
                    // Retrieve login URL from spotify service
                    String url = service.getAuthorizeURL();
                    
                    // Send it back
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", url).build();
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "login":
                    // Extract spotify code
                    String code = data.getString("code");
                    System.out.println("Code: " + code);
                    
                    // Get user from spotify
                    user = service.getUser(code);
                    
                    // Check if user already exists
                    UserIdentity current = db.getUserCatalogue().getByName(user.getUser().getName());
                    if (current != null)    //Already exists
                        user = current;
                    else                    // New user 
                        db.getUserCatalogue().create(user);
                    userSession.setUserIdentity(user);
                    
                    // Create user json
                    String userAsString = gson.toJson(user.toJsonElement());
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", userAsString).build();
                    
                    // Send back result
                    System.out.println("User: " + userAsString);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "setUser":
                    // Extract user id
                    Long id = data.getJsonNumber("id").longValue();
                    System.out.println("id: " + id);
                    
                    // Check if user exists
                    boolean success = true;
                    user = db.getUserCatalogue().find(id);
                    if (user == null) {
                        user = UserIdentity.createDummyUser();
                        success = false;
                    }else{
                        service.setTokens(user.getAccessToken(), user.getRefreshToken());
                    }
                    userSession.setUserIdentity(user);
                    
                    // Send response
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", success).build();
                    System.out.println("Success: " + success);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getPlaylists":
                    System.out.println("User: " + gson.toJson(userSession.getUserIdentity()));
                    
                    // Get users playlist from spotfiy service
                    List<SimplePlaylist> lists = service.getUsersPlaylists();
                    
                    // Send them back as json
                    String playlists = gson.toJson(lists);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", playlists).build();
                    System.out.println("Playlists: " + playlists);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getUsers":
                    // Retrieve online users from session handler
                    List<UserIdentity> onlineUsers = sessionHandler.getUsers();
                    
                    // Create user json
                    List<JsonElement> onlineUsersAsJson = new ArrayList<>();
                    for(UserIdentity userIdentity : onlineUsers)
                        onlineUsersAsJson.add(userIdentity.toJsonElement());
                    
                    // Send them back as json
                    String usersString = gson.toJson(onlineUsersAsJson);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", usersString).build();
                    System.out.println("Users: " + usersString);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "logout":
                    sessionHandler.getUserSession(session.getId()).setUserIdentity(UserIdentity.createDummyUser());
                    break;
                case "answer":
                    // TODO
                    break;
                case "createQuiz":
                    // Extract users to invite, what playlist to base quiz on and number of questions in quiz.
                    Long[] userIds = (Long[]) jsonMessage.getJsonArray("users").toArray();
                    String playlistId = jsonMessage.getString("playlist");
                    int nbrOfSongs = jsonMessage.getInt("nbrOfSongs");

                    // Get the tracks to base the quiz on
                    List<Track> tracks = service.getPlaylistSongs(playlistId);
                    List<Track> similarTracks = service.getSimilarTracks(tracks, nbrOfSongs);
                    List<String> similarTrackIds = new ArrayList<>();
                    for(Track track : similarTracks)
                        similarTrackIds.add(track.getId());

                    // Create quiz
                    Quiz quiz = new Quiz(userSession.getUserIdentity().getId(), Arrays.asList(userIds), similarTrackIds);
                    db.getQuizCatalogue().create(quiz);
                    
                    // TODO invite users to quiz
                    
                    // Send back the resulting quiz
                    String jsonQuiz = gson.toJson(quiz);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", jsonQuiz).build();
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