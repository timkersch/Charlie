package core;

import java.util.*;

/**
 * Created by jcber on 2016-03-04.
 */

public class Quiz {
    private String uuid;
    private String name;
    private final List<UserIdentity> players = new ArrayList<>();
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
        this.players.addAll(players);
        this.questions.addAll(questions);
        this.currentQuestion = 0;
    }

    public List<UserIdentity> getPlayers() {
        return players;
    }

    public UserIdentity getOwner() {
        return owner;
    }

    public List<Question> getQuestion() {
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
