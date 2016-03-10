package core;

import java.util.*;

/**
 * Created by jcber on 2016-03-04.
 */

public class Quiz {
    private String uuid;
    private String name;
    private final List<UserIdentity> joinedPlayers = new ArrayList<>();
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
        this.currentQuestion = 0;
    }

    public List<UserIdentity> getUnjoinedPlayers() {
        return unjoinedPlayers;
    }
    
    public List<UserIdentity> getJoinedPlayers() {
        return joinedPlayers;
    }
    
    public boolean joinPlayer(UserIdentity user) {
        if (unjoinedPlayers.remove(user)) {
            joinedPlayers.add(user);
            return true;
        }
        return false;
    }
    
    public boolean leavePlayer(UserIdentity user) {
        return joinedPlayers.remove(user);
    }

    public UserIdentity getOwner() {
        return owner;
    }

    public List<Question> getQuestions() {
        return this.questions;
    }
    
    public Question getCurrentQuestion(){
        return questions.get(currentQuestion);
    }
    
    public Question getNextQuestion(){
        return questions.get(currentQuestion++);
    }
    
    public String getUUID(){
        return uuid;
    }

}
