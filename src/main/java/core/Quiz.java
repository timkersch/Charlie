package core;

import java.util.*;

/**
 * Created by jcber on 2016-03-04.
 */

public class Quiz {
    private String uuid;
    private String name;

    private final List<Player> players = new ArrayList<>();
    private final List<UserIdentity> invitedUsers = new ArrayList<>();
	private final List<Question> questions = new ArrayList<>();

	private int currentQuestion;

    public Quiz(){
        this.uuid = UUID.randomUUID().toString();
    }

    public Quiz(String name, UserIdentity owner, List<UserIdentity> players, List<Question> questions){
        this();
        this.name = name;
	    this.players.add(new Player(owner, true));
        this.invitedUsers.addAll(players);
        this.questions.addAll(questions);
        this.currentQuestion = -1;
    }

    public List<UserIdentity> getUnjoinedPlayers() {
        return invitedUsers;
    }
    
    public List<UserIdentity> getJoinedPlayers() {
	    List<UserIdentity> userIdentities = new ArrayList<UserIdentity>();
        for (Player p : players) {
	        userIdentities.add(p.getUserIdentity());
        }
	    return userIdentities;
    }
    
    public boolean joinPlayer(UserIdentity user) {
        if (invitedUsers.remove(user)) {
            players.add(new Player(user, false));
            return true;
        }
        return false;
    }
    
    public boolean leavePlayer(UserIdentity user) {
	    Iterator<Player> it = players.iterator();
	    while(it.hasNext()) {
		    if (it.next().getUserIdentity().equals(user)) {
			    it.remove();
			    return true;
		    }
	    }
	    return false;
    }

    public UserIdentity getOwner() {
        for (Player p : players) {
	        if (p.isOwner()) {
		        return p.getUserIdentity();
	        }
        }
	    return null;
    }

	public Map<Question, String> getUserResults(UserIdentity id) {
		for(Player p : players) {
			if (p.getUserIdentity().equals(id)) {
				return p.getAnswers();
			}
		}
		return null;
	}

	public int getUserPoints(UserIdentity id) {
		for(Player p : players) {
			if (p.getUserIdentity().equals(id)) {
				return p.getScore();
			}
		}
		return 0;
	}

	public List<Player> getAllResults() {
		return this.players;
	}

    public List<Question> getQuestions() {
        return this.questions;
    }
    
    public Question getCurrentQuestion(){
        if (currentQuestion < 0 || currentQuestion >= questions.size())
            return null;
        return questions.get(currentQuestion);
    }
    
    public boolean answerQuestion(UserIdentity user, String artistName) {
	    for (Player p : players) {
		    if (p.getUserIdentity().equals(user)) {
			    return p.setAnswer(this.getCurrentQuestion(), artistName);
		    }
	    }
	    return false;
    }
    
    public Question getNextQuestion(){
        if (questions.size() == currentQuestion + 1)
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
