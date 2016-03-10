package core;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.wrapper.spotify.models.SimplePlaylist;
import com.wrapper.spotify.models.Track;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@ServerEndpoint("/api")
public class WebsocketServer {

    @Inject
    private DB db;

    @PersistenceContext(unitName = "db")
    EntityManager em; 

    @Inject
    private SessionHandler sessionHandler;
    
    private final SpotifyService service = new SpotifyService();
    
    private static final Gson GSON = new Gson();
    private static final Logger LOGGER = Logger.getLogger(WebsocketServer.class.getName());

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
        LOGGER.log(Level.WARNING, error.toString());
    }
    
    private void log(String msg){
        LOGGER.log(Level.INFO, msg);
    }
    
    private String createResponse(int requestId, String action, Object data){
        JsonResponse r = new JsonResponse();
        r.request_id = requestId;
        r.action = action;
        r.data = data;
        return GSON.toJson(r);
    }

    @OnMessage
    public void handleMessage(String message, Session session) {
        try{
            JsonObject jsonMessage = GSON.fromJson(message, JsonObject.class);

            // Extract the action, requestId and data from the json message
            JsonObject data = jsonMessage.getAsJsonObject("data");
            String action = jsonMessage.get("action").getAsString();
            int requestId = jsonMessage.getAsJsonPrimitive("request_id").getAsInt();

            // Get the user session attached to this session
            UserSession userSession = sessionHandler.getUserSession(session.getId());

            // Create objects needed by action
            String response = "";
            UserIdentity user;

            log(action + " - DATA: " + data);
            switch(action) {
                case "getLoginURL":
                    // Retrieve login URL from spotify service
                    String url = service.getAuthorizeURL();

                    // Send it back
                    response = createResponse(requestId, action, url);
                    session.getBasicRemote().sendText(response);
                    break;
                case "login":
                    // Extract spotify code
                    String code = data.getAsJsonPrimitive("code").getAsString(); //.getString("code");

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
                    String userAsString = GSON.toJson(user.toJsonElement());
                    response = createResponse(requestId, action, userAsString);

                    // Send back result
                    System.out.println("User: " + userAsString);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "setUser":
                    // Extract user id
                    Long id = data.getAsJsonPrimitive("id").getAsLong(); //getJsonNumber("id").longValue();

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
                    response = createResponse(requestId, action, success);
                    //response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", success).build();
                    System.out.println("Success: " + success);
                    session.getBasicRemote().sendText(response);
                    break;
                case "getPlaylists":
                    // Get users playlist from spotfiy service
                    List<SimplePlaylist> lists = service.getUsersPlaylists();

                    // Send them back as json
                    String playlists = GSON.toJson(lists);
                    response = createResponse(requestId, action, playlists);
                    //response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", playlists).build();
                    System.out.println("Playlists: " + playlists);
                    session.getBasicRemote().sendText(response);
                    break;
                case "getUsers":
                    // Retrieve online users from session handler
                    List<UserIdentity> onlineUsers = sessionHandler.getUsers();

                    // Create user json
                    List<JsonElement> onlineUsersAsJson = new ArrayList<>();
                    for(UserIdentity userIdentity : onlineUsers)
                        onlineUsersAsJson.add(userIdentity.toJsonElement());

                    // Send them back as json
                    String usersString = GSON.toJson(onlineUsersAsJson);
                    response = createResponse(requestId, action, usersString);
                    //response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", usersString).build();
                    log("Users: " + usersString);
                    session.getBasicRemote().sendText(response);
                    break;
                case "logout":
                    sessionHandler.getUserSession(session.getId()).setUserIdentity(UserIdentity.createDummyUser());
                    break;
                case "answerQuestion":
                    String artist = data.getAsJsonPrimitive("artistName").getAsString(); //getString("artistName");
                    System.out.println("Answer: " + artist);
                    boolean right = userSession.getCurrentQuiz().answerQuestion(userSession.getUserIdentity(), artist);
                    log("After answer: " + userSession.getCurrentQuiz().getResults());

                    response = createResponse(requestId, action, right);
                    System.out.println("Response: " + response);
                    session.getBasicRemote().sendText(response);
                    break;
                case "joinQuiz":
                    String quizId = data.getAsJsonPrimitive("quizId").getAsString(); //.getString("quizId");
                    Quiz quizToJoin = db.getQuizCatalogue().findQuiz(quizId);
                    boolean joinSuccess = false;

                    if (quizToJoin != null) {
                        userSession.setCurrentQuiz(quizToJoin);
                        sessionHandler.sendToQuizMemebrs(quizToJoin, "userJoined", userSession.getUserIdentity().toJsonElement().toString());
                        joinSuccess = true;
                    }

                    response = createResponse(requestId, action, joinSuccess);
                    //response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", joinSuccess).build();
                    System.out.println("Response: " + response);
                    session.getBasicRemote().sendText(response.toString());
                    break;
                case "leaveQuiz":
                    userSession.getCurrentQuiz().leavePlayer(userSession.getUserIdentity());
                    userSession.setCurrentQuiz(null);
                    break;
                case "nextQuestion":
                    if (userSession.getCurrentQuiz().getOwner().getId() != userSession.getUserIdentity().getId())
                        return;
                    Question question = userSession.getCurrentQuiz().getCurrentQuestion();
                    Question nextQuestion = userSession.getCurrentQuiz().getNextQuestion();

                    // TODO Send wrong anser for last question.
                    

                    if (nextQuestion == null) {
                        // Quiz is over
                        Quiz over = userSession.getCurrentQuiz();
                        Map<UserIdentity, Integer> results = over.getResults();
                        log("GameOver: " + results);
                        JsonArray array = new JsonArray();
                        for (UserIdentity identity : results.keySet()) {
                            JsonObject o = GSON.toJsonTree(identity).getAsJsonObject();
                            o.addProperty("points", results.get(identity));
                            array.add(o);
                        }
                        String arrayString = GSON.toJson(array);
                        
                        sessionHandler.sendToQuizMemebrs(over, "gameOver", arrayString);
                        log("GameOver: " + arrayString);
                        
                        response = createResponse(requestId, action, "");
                        session.getBasicRemote().sendText(response);
                    } else {
                        // Send them back as json
                        String nextTrack = service.getTrackUrl(nextQuestion.getTrackId());
                        JsonElement artistsAsJson = GSON.toJsonTree(nextQuestion.getArtists()); //.toJson(nextQuestion.getArtists());
                        JsonObject obj = new JsonObject();
                        obj.addProperty("track_url", nextTrack);
                        obj.add("artists", artistsAsJson);
                        String objString = obj.toString();
                        //JsonObjectBuilder trackData = provider.createObjectBuilder().add("track_url", nextTrack).add("artists", artistsAsJson);
                        
                        sessionHandler.sendToSessions(userSession.getCurrentQuiz(), "newQuestion", objString);
                        
                        response = createResponse(requestId, action, objString);
                        session.getBasicRemote().sendText(response);
                    }
                    break;
                case "createQuiz":
                    // Extract users to invite, what playlist to base quiz on and number of questions in quiz.

                    JsonArray usernames = data.getAsJsonArray("users");
                    String name = data.getAsJsonPrimitive("name").getAsString(); //getString("name");
                    String playlistId = data.getAsJsonPrimitive("playlist").getAsString();//data.getString("playlist");
                    int nbrOfSongs = data.getAsJsonPrimitive("nbrOfSongs").getAsInt(); //Integer.parseInt(data.getString("nbrOfSongs"));
                    boolean generate = data.getAsJsonPrimitive("generated").getAsBoolean(); //data.getBoolean("generated");


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
                        questions.add(new Question(quizTracks.get(i), service.getArtistOptions(quizTracks.get(i))));
                    }

                    // Get users
                    List<UserIdentity> players = new ArrayList<>();
                    for (JsonElement username : usernames) {
                        UserIdentity userToAdd = sessionHandler.findUserByName(username.getAsString());
                        if (userToAdd != null)
                            players.add(userToAdd);
                    }

                    // Create quiz
                    Quiz quiz = new Quiz(name, userSession.getUserIdentity(), players, questions);
                    userSession.setCurrentQuiz(quiz);
                    db.getQuizCatalogue().addQuiz(quiz);

                    // Send back the resulting quiz
                    String jsonQuiz = GSON.toJson(quiz);
                    response = createResponse(requestId, action, jsonQuiz);
                    //response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", jsonQuiz).build();
                    session.getBasicRemote().sendText(response);
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
            log("Response: " + response);
        }catch(IOException exception) {
            exception.printStackTrace();
            LOGGER.log(Level.WARNING, exception.toString());
        }
    }

}