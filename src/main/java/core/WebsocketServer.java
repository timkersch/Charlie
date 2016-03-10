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
import java.util.logging.Logger;

@ServerEndpoint("/api")
public class WebsocketServer {

    @Inject
    private DB db;

    @PersistenceContext(unitName = "db")
    EntityManager em; 

    private final SpotifyService service = new SpotifyService();
    
    private static final Logger logger = Logger.getLogger(WebsocketServer.class.getName());

    @Inject
    private SessionHandler sessionHandler;

    @OnOpen
    public void open(Session session) {
        log("OnOpen: " + session.getId());
        System.out.println("Opened Session: " + session.getId());
        UserSession userSession = new UserSession(session);
        sessionHandler.addSession(userSession);
    }

    @OnClose
    public void close(Session session) {
        log("OnClose: " + session.getId());
        UserSession userSession = sessionHandler.getUserSession(session.getId());
        sessionHandler.removeSession(userSession);
    }

    @OnError
    public void onError(Throwable error) {
        error.printStackTrace();
        log("OnError: " + error.toString());
    }
    
    private void log(String msg){
        System.out.println(msg);
        //logger.log(Level.INFO, msg);
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
            
            log(action + " - DATA: " + data);
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
                    
                    // Check if user exists
                    boolean success = true;
                    user = db.getUserCatalogue().find(id);
                    if (user == null) {
                        user = UserIdentity.createDummyUser();
                        success = false;
                    }else{
                        String newAccessToken = service.refreshAccessToken(user.getRefreshToken());
                        user.setAccessToken(newAccessToken);
                        service.setTokens(user.getAccessToken(), user.getRefreshToken());
                    }
                    userSession.setUserIdentity(user);
                    
                    // Send response
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", success).build();
                    System.out.println("Success: " + success);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "getPlaylists":
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
                    log("Users: " + usersString);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "logout":
                    sessionHandler.getUserSession(session.getId()).setUserIdentity(UserIdentity.createDummyUser());
                    break;
                case "answerQuestion":
                    String artist = data.getString("artistName");
                    boolean right = userSession.getCurrentQuiz().answerQuestion(userSession.getUserIdentity(), artist);
                    
                    
                    // TODO
                    break;
                case "joinQuiz":
                    String quizId = data.getString("quizId");
                    Quiz quizToJoin = db.getQuizCatalogue().findQuiz(quizId);
                    boolean joinSuccess = false;
                    
                    if (quizToJoin != null) {
                        userSession.setCurrentQuiz(quizToJoin);
                        sessionHandler.sendToQuizMemebrs(quizToJoin, "userJoined", userSession.getUserIdentity().toJsonElement().toString());
                        joinSuccess = true;
                    }
                    
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", joinSuccess).build();
                    System.out.println("Response: " + response);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "leaveQuiz":
                    userSession.getCurrentQuiz().leavePlayer(userSession.getUserIdentity());
                    userSession.setCurrentQuiz(null);
                    break;
                case "nextQuestion":
                    Question question = userSession.getCurrentQuiz().getCurrentQuestion();
                    Question nextQuestion = userSession.getCurrentQuiz().getNextQuestion();
                    
                    // TODO Send wrong anser for last question.
                    //sessionHandler.sendToQuizMemebrs(userSession.getCurrentQuiz(), "answer", false);
                    
                    // Send them back as json
                    String nextTrack = service.getTrackUrl(nextQuestion.getTrackId());
                    String artistsAsJson = gson.toJson(nextQuestion.getArtists());
                    JsonObject trackData = provider.createObjectBuilder().add("track_url", nextTrack).add("artists", artistsAsJson).build();
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", trackData).build();
                    System.out.println("Response: " + response);
                    session.getBasicRemote().sendText(response.toString());
                    sessionHandler.sendToSessions(userSession.getCurrentQuiz(), "newQuestion", trackData.toString());
                    break;
                case "createQuiz":
                    // Extract users to invite, what playlist to base quiz on and number of questions in quiz.
                    JsonArray usernames = data.getJsonArray("users");
                    String name = data.getString("name");
                    String playlistId = data.getString("playlist");
                    int nbrOfSongs = Integer.parseInt(data.getString("nbrOfSongs"));
                    boolean generate = true;/*data.getBoolean("generated")*/;

                    List<Track> playlistTracks = service.getPlaylistSongs(playlistId);
                    List<Track> quizTracks;

                    if (generate) {
                            quizTracks = service.getSimilarTracks(playlistTracks, nbrOfSongs);
                    } else {
                            Collections.shuffle(playlistTracks);
                            quizTracks = playlistTracks.subList(0, nbrOfSongs);
                    }

                    List<Question> questions = new ArrayList<>();
                    for(int i = 0; i < quizTracks.size(); i++) {
                        questions.add(new Question(quizTracks.get(i), service.getQuizOptions(quizTracks.get(i))));
                    }
                    
                    // Get users
                    List<UserIdentity> players = new ArrayList<>();
                    for (JsonValue username : usernames) {
                        UserIdentity userToAdd = sessionHandler.findUserByName(username.toString());
                        if (userToAdd != null)
                            players.add(userToAdd);
                    }

                    // Create quiz
                    Quiz quiz = new Quiz(name, userSession.getUserIdentity(), players, questions);
                    userSession.setCurrentQuiz(quiz);
                    
                    // Send back the resulting quiz
                    String jsonQuiz = gson.toJson(quiz);
                    response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", jsonQuiz).build();
                    session.getBasicRemote().sendText(response.toString());
                    sessionHandler.sendToSessions(quiz, "invitedTo", jsonQuiz);
                    break;
	            case "savePlaylist":
		            String name1 = userSession.getCurrentQuiz().getName();
		            List<Question> question1 = userSession.getCurrentQuiz().getQuestions();
		            List<String> trackids = new ArrayList<>(question1.size());
		            for (Question q : question1) {
			            trackids.add(q.getTrackId().getId());
		            }
		            service.createAndPopulatePlaylist(trackids, name1);
		            break;
                default:
                    sessionHandler.sendToAllConnectedSessions("noRequest", "error");
                    break;
            }
        } catch (IOException e) {
            log(e.toString());
        }
    }

}