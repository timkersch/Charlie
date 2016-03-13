package web;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.wrapper.spotify.models.SimplePlaylist;
import com.wrapper.spotify.models.Track;
import core.*;
import java.lang.reflect.Method;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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

    public static final Gson GSON = new Gson();
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

    private void log(String msg) {
        LOGGER.log(Level.INFO, msg);
    }

    private String createResponse(int requestId, String action, Object data) {
        JsonResponse r = new JsonResponse();
        r.request_id = requestId;
        r.action = action;
        r.data = data;
        return GSON.toJson(r);
    }

    @OnMessage
    public void handleMessage(String message, Session session) {
        // Read message
        JsonObject jsonMessage = GSON.fromJson(message, JsonObject.class);

        // Extract the action, requestId and data from the json message
        JsonObject data = jsonMessage.getAsJsonObject("data");
        String action = jsonMessage.get("action").getAsString();
        int requestId = jsonMessage.getAsJsonPrimitive("request_id").getAsInt();

        // Get the user session attached to this session
        UserSession userSession = sessionHandler.getUserSession(session.getId());

        log(action + " - Data: " + data);
        
        // Try to invoke the method of the action
        try {
            Method methodToCall = WebsocketServer.class.getDeclaredMethod(action, int.class, String.class, JsonObject.class, UserSession.class);
            
            methodToCall.invoke(this, requestId, action, data, userSession);
        } catch (Exception ex) {
            userSession.send(createResponse(requestId, action, ""));
            Logger.getLogger(WebsocketServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    private void getLoginURL(int requestId, String action, JsonObject data, UserSession userSession) {
        // Retrieve login URL from spotify service
        String url = service.getAuthorizeURL();

        // Send it back
        String response = createResponse(requestId, action, url);
        userSession.send(response);
    }
    
    private void login(int requestId, String action, JsonObject data, UserSession userSession) {
        // Extract spotify code
        String code = data.getAsJsonPrimitive("code").getAsString(); //.getString("code");

        // Get user from spotify
        UserIdentity user = service.getUser(code);

        // Check if user already exists
        UserIdentity current = db.getUserCatalogue().getByName(user.getUser().getName());
        if (current != null) {
            // Already exists
            current.setAccessToken(user.getAccessToken());
            current.setRefreshToken(user.getRefreshToken());
            db.getUserCatalogue().update(current);
            user = current;
        } else // New user 
            db.getUserCatalogue().create(user);
        
        userSession.setUserIdentity(user);

        // Create user json
        String userAsString = GSON.toJson(user.toJson());
        String response = createResponse(requestId, action, userAsString);

        // Send back result
        System.out.println("User: " + userAsString);
        userSession.send(response);
        
    }
    
    private void setUser(int requestId, String action, JsonObject data, UserSession userSession) {
        // Extract user id
        Long id = data.getAsJsonPrimitive("id").getAsLong();

        // Check if user exists
        boolean success = true;
        UserIdentity user = db.getUserCatalogue().find(id);
        if (user == null) {
            user = UserIdentity.createDummyUser();
            success = false;
        } else {
            String newAccessToken = service.refreshAccessToken(user.getRefreshToken());
            user.setAccessToken(newAccessToken);
            service.setTokens(user.getAccessToken(), user.getRefreshToken());
            userSession.setCurrentQuiz(db.getQuizCatalogue().getQuiz(user));
        }
        userSession.setUserIdentity(user);

        // Send response
        String response = createResponse(requestId, action, success);
        System.out.println("Success: " + success);
        userSession.send(response);
    }
    
    private void getPlaylists(int requestId, String action, JsonObject data, UserSession userSession) {
        // Get users playlist from spotfiy service
        List<SimplePlaylist> lists = service.getUsersPlaylists();

        // Send them back as json
        JsonArray array = new JsonArray();
        for (SimplePlaylist playlist : lists) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", playlist.getId());
            obj.addProperty("name", playlist.getName());
            obj.addProperty("owner", playlist.getOwner().getId());
            obj.addProperty("url", playlist.getExternalUrls().get("spotify"));
            obj.addProperty("nbrOfTracks", playlist.getTracks().getTotal());
            array.add(obj);
        }
        String playlists = GSON.toJson(array);
        String response = createResponse(requestId, action, playlists);
        System.out.println("Playlists: " + playlists);
        userSession.send(response);
    }
    
    private void getCurrentQuestion(int requestId, String action, JsonObject data, UserSession userSession) {
        Question currentQuestion = userSession.getCurrentQuiz().getCurrentQuestion();
        Player player = userSession.getCurrentQuiz().getPlayer(userSession.getUserIdentity());
        // Send them back as json
        String trackUrl = service.getTrackUrl(currentQuestion.getTrackId());
        JsonElement artistsJson = GSON.toJsonTree(currentQuestion.getArtists());
        JsonObject object = new JsonObject();
        object.addProperty("track_url", trackUrl);
        object.add("artists", artistsJson);
        object.addProperty("answered", player.hasAnswered(currentQuestion));
        String objAsString = object.toString();

        String response = createResponse(requestId, action, objAsString);
        userSession.send(response);
    }
    
    private void isQuizStarted(int requestId, String action, JsonObject data, UserSession userSession) {
        // Retrieve online users from session handler
        boolean started = userSession.getCurrentQuiz().getCurrentQuestion() != null;

        // Send them back as json
        String response = createResponse(requestId, action, started);
        userSession.send(response);
    }
    
    private void getUsers(int requestId, String action, JsonObject data, UserSession userSession) {
        // Retrieve online users from session handler
        List<UserIdentity> onlineUsers = sessionHandler.getUsers();

        // Create user json
        List<JsonElement> onlineUsersAsJson = new ArrayList<>();
        for (UserIdentity userIdentity : onlineUsers) {
            onlineUsersAsJson.add(userIdentity.toJson());
        }

        // Send them back as json
        String usersString = GSON.toJson(onlineUsersAsJson);
        String response = createResponse(requestId, action, usersString);
        //response = provider.createObjectBuilder().add("request_id", requestId).add("action", action).add("data", usersString).build();
        log("Users: " + usersString);
        userSession.send(response);
    }
    
    private void getUsersInQuiz(int requestId, String action, JsonObject data, UserSession userSession) {
        // Retrieve online users from session handler
        List<UserIdentity> usersInQuiz = userSession.getCurrentQuiz().getJoinedPlayers();

        // Create user json
        List<JsonElement> usersInQuizAsJson = new ArrayList<>();
        for (UserIdentity userIdentity : usersInQuiz) {
            usersInQuizAsJson.add(userIdentity.toJson());
        }

        // Send them back as json
        String usersInQuizString = GSON.toJson(usersInQuizAsJson);
        String response = createResponse(requestId, action, usersInQuizString);
        log("Users: " + usersInQuizString);
        userSession.send(response);
    }
    
    private void logout(int requestId, String action, JsonObject data, UserSession userSession) {
        userSession.setUserIdentity(UserIdentity.createDummyUser());
    }
    
    private void getResults(int requestId, String action, JsonObject data, UserSession session) {
        // Send back the resulting quiz
        Quiz quiz = session.getCurrentQuiz();
        List<Player> players = quiz.getAllResults();
        JsonArray playersAsJson = new JsonArray();
        for (Player p : players)
            playersAsJson.add(p.toJson());
        
        String playersString = GSON.toJson(playersAsJson);

        String response = createResponse(requestId, action, playersString);
        session.send(response);
    }
    
    private void getQuiz(int requestId, String action, JsonObject data, UserSession session) {
        // Send back the resulting quiz
        String quizAsJson = "";
        if (session.getCurrentQuiz() != null)
            quizAsJson = GSON.toJson(session.getCurrentQuiz().toJson());

        String response = createResponse(requestId, action, quizAsJson);
        session.send(response);
    }
    
    private void savePlaylist(int requestId, String action, JsonObject data, UserSession session) {
        String name1 = session.getCurrentQuiz().getName();
        List<Question> question1 = session.getCurrentQuiz().getQuestions();
        List<String> trackids = new ArrayList<>(question1.size());

        for (Question que : question1) {
            trackids.add(que.getTrackId().getId());
        }

        service.createAndPopulatePlaylist(trackids, name1);
    }
    
    private void createQuiz(int requestId, String action, JsonObject data, UserSession session) {
        // Extract users to invite, what playlist to base quiz on and number of questions in quiz.
        JsonArray usernames = data.getAsJsonArray("users");
        String name = data.getAsJsonPrimitive("name").getAsString(); //getString("name");
        String playlistId = data.getAsJsonPrimitive("playlist").getAsString();//data.getString("playlist");
        int nbrOfSongs = data.getAsJsonPrimitive("nbrOfSongs").getAsInt(); //Integer.parseInt(data.getString("nbrOfSongs"));
        boolean generate = data.getAsJsonPrimitive("generated").getAsBoolean(); //data.getBoolean("generated");
        String ownerId = data.getAsJsonPrimitive("playlistOwner").getAsString();

        List<Track> playlistTracks = service.getPlaylistSongs(playlistId, ownerId);
        List<Track> quizTracks;

        if (generate) {
            quizTracks = service.getSimilarTracks(playlistTracks, nbrOfSongs);
        } else {
            Collections.shuffle(playlistTracks);
            quizTracks = playlistTracks.subList(0, nbrOfSongs);
        }

        List<Question> questions = new ArrayList<>();
        for (int i = 0; i < quizTracks.size(); i++) {
            questions.add(new Question(quizTracks.get(i), service.getArtistOptions(quizTracks.get(i))));
        }

        // Get users
        List<UserIdentity> players = new ArrayList<>();
        for (JsonElement username : usernames) {
            UserIdentity userToAdd = sessionHandler.findUserByName(username.getAsString());
            if (userToAdd != null) {
                players.add(userToAdd);
            }
        }

        // Create quiz
        Quiz quiz = new Quiz(name, session.getUserIdentity(), players, questions);
        db.getQuizCatalogue().removeUserFromQuizes(session.getUserIdentity());
        session.setCurrentQuiz(quiz);
        db.getQuizCatalogue().addQuiz(quiz);

        // Send back the resulting quiz
        String jsonQuiz = GSON.toJson(quiz.toJson());
        String response = createResponse(requestId, action, jsonQuiz);
        session.send(response);
        sessionHandler.sendToSessions(players, "invitedTo", jsonQuiz);
    }
    
    private void getUserResults(int requestId, String action, JsonObject data, UserSession session) {
        Quiz q = session.getCurrentQuiz();

        Player p = q.getPlayer(session.getUserIdentity());

        String arrayString = GSON.toJson(p.toJson());

        String response = createResponse(requestId, action, arrayString);
        session.send(response);
    }
    
    private void nextQuestion(int requestId, String action, JsonObject data, UserSession session) {
        if (session.getCurrentQuiz().getOwner().getId() != session.getUserIdentity().getId()) {
            return;
        }
        Question question = session.getCurrentQuiz().getCurrentQuestion();
        Question nextQuestion = session.getCurrentQuiz().getNextQuestion();

        if (question == null) {
            // Quiz started
            sessionHandler.sendToSessions(session.getCurrentQuiz(), "quizStart", "");
        }

        if (nextQuestion == null) {
            // Quiz is over
            Quiz over = session.getCurrentQuiz();
            List<Player> results = over.getAllResults();
            
            JsonArray array = new JsonArray();
            for (Player p : results) {
                array.add(p.toJson());
            }

            String arrayString = GSON.toJson(array);

            sessionHandler.sendToQuizMembers(over, "gameOver", arrayString);
            log("GameOver: " + arrayString);

            String response = createResponse(requestId, action, "");
            session.send(response);

        } else {
            // Send them back as json
            String nextTrack = service.getTrackUrl(nextQuestion.getTrackId());
            JsonElement artistsAsJson = GSON.toJsonTree(nextQuestion.getArtists()); //.toJson(nextQuestion.getArtists());
            JsonObject obj = new JsonObject();
            obj.addProperty("track_url", nextTrack);
            obj.add("artists", artistsAsJson);
            String objString = obj.toString();

            log("newQuestion: " + objString);
            sessionHandler.sendToSessions(session.getCurrentQuiz(), "newQuestion", objString);

            String response = createResponse(requestId, action, objString);
            session.send(response);
        }
    }
    
    private void leaveQuiz(int requestId, String action, JsonObject data, UserSession session) {
        session.getCurrentQuiz().leavePlayer(session.getUserIdentity());
        session.setCurrentQuiz(null);
    }
    
    private void joinQuiz(int requestId, String action, JsonObject data, UserSession session) {
        String quizId = data.getAsJsonPrimitive("quizId").getAsString();
        Quiz quizToJoin = db.getQuizCatalogue().findQuiz(quizId);
        boolean joinSuccess = false;

        if (quizToJoin != null) {
            session.setCurrentQuiz(quizToJoin);
            quizToJoin.joinPlayer(session.getUserIdentity());
            sessionHandler.sendToQuizMembers(quizToJoin, "userJoined", session.getUserIdentity().toJson().toString());
            joinSuccess = true;
        }

        String response = createResponse(requestId, action, joinSuccess);
        log("Response: " + response);
        session.send(response);
    }
    
    private void answerQuestion(int requestId, String action, JsonObject data, UserSession userSession) {
        Quiz quiz = userSession.getCurrentQuiz();
        String artist = data.getAsJsonPrimitive("artistName").getAsString();
        boolean right = quiz.answerQuestion(userSession.getUserIdentity(), artist);
        String rightAnswer = quiz.getCurrentQuestion().getCorrect();

        String response = createResponse(requestId, action, rightAnswer);
        String player = GSON.toJson(quiz.getPlayer(userSession.getUserIdentity()).toJson());
        sessionHandler.sendToQuizMembers(quiz, "userPointsUpdate", player);
        log("Response: " + response);
        userSession.send(response);
    }

}
