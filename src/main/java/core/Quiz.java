package core;

import java.util.*;

/**
 * Created by jcber on 2016-03-04.
 */

public class Quiz {
    private String uuid;
    private String name;
    private final Map<UserIdentity, Integer> joinedPlayers = new HashMap<>();
    private final List<UserIdentity> unjoinedPlayers = new ArrayList<>();
    private final List<Question> questions = new ArrayList<>();
    private int currentQuestion;
    private UserIdentity owner;

    public Quiz(){
        this.uuid = UUID.randomUUID().toString();
    }

    public Quiz(String name, UserIdentity owner, List<UserIdentity> players, List<Question> questions){
        this();
        this.name = name;
        this.owner = owner;
        this.unjoinedPlayers.addAll(players);
        this.questions.addAll(questions);
        this.currentQuestion = -1;
    }

    public List<UserIdentity> getUnjoinedPlayers() {
        return unjoinedPlayers;
    }
    
    public List<UserIdentity> getJoinedPlayers() {
        return new ArrayList<>(joinedPlayers.keySet());
    }
    
    public Map<UserIdentity, Integer> getResults() {
        return joinedPlayers;
    }
    
    public boolean joinPlayer(UserIdentity user) {
        if (unjoinedPlayers.remove(user)) {
            joinedPlayers.put(user, 0);
            return true;
        }
        return false;
    }
    
    public boolean leavePlayer(UserIdentity user) {
        return joinedPlayers.remove(user) > 0;
    }

    public UserIdentity getOwner() {
        return owner;
    }

    public List<Question> getQuestions() {
        return this.questions;
    }
    
    public Question getCurrentQuestion(){
        if (currentQuestion < 0)
            return null;
        return questions.get(currentQuestion);
    }
    
    public boolean answerQuestion(UserIdentity user, String artistName) {
        if (this.getCurrentQuestion().answer(artistName)) {
            int currentPoints = joinedPlayers.getOrDefault(user, 0);
            joinedPlayers.replace(user, currentPoints+1);
            return true;
        }
        return false;
    }
    
    public Question getNextQuestion(){
        if (questions.size() == currentQuestion)
            return null;
        return questions.get(++currentQuestion);
    }
    
    public String getUUID(){
        return uuid;
    }

    public String getName() {
        return name;
    }

}
