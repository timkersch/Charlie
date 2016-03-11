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

	/**
	 * Returns a list of users that are invited to the quiz but have not joined
	 * @return a list of UserIdentity
	 */
    public List<UserIdentity> getUnjoinedPlayers() {
        return invitedUsers;
    }

	/**
	 * Returns a list of UserIdentitys that are the joined players of the quiz
	 * @return a list of UserIdentity
	 */
	public List<UserIdentity> getJoinedPlayers() {
	    List<UserIdentity> userIdentities = new ArrayList<UserIdentity>();
        for (Player p : players) {
	        userIdentities.add(p.getUserIdentity());
        }
	    return userIdentities;
    }

	/**
	 * Adds a user to a quiz
	 * @param user the user to be added
	 * @return true if user was invited i.e can be added, otherwise false
	 */
    public boolean joinPlayer(UserIdentity user) {
        if (invitedUsers.remove(user)) {
            players.add(new Player(user, false));
            return true;
        }
        return false;
    }

	/**
	 * Removes a player from this quiz
	 * @param user the user to be removed
	 * @return true if user was in the quiz, otherwise false
	 */
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

	/**
	 * Returns the UserIdentity of the ower of this quiz
	 * @return a UserIdentity
	 */
    public UserIdentity getOwner() {
        for (Player p : players) {
	        if (p.isOwner()) {
		        return p.getUserIdentity();
	        }
        }
	    return null;
    }

	/**
	 * Returns a Map of Questions and answers that a particular user has made
	 * @param id the UserIdentity to be considered
	 * @return a Map of questions and answers if user has answered questions, otherwise null
	 */
	public Map<Question, String> getUserResults(UserIdentity id) {
		for(Player p : players) {
			if (p.getUserIdentity().equals(id)) {
				return p.getAnswers();
			}
		}
		return null;
	}

	/**
	 * Returns the points number of points in this quiz for a User
	 * @param id the UserIdentity
	 * @return an integer that is the number of points collected
	 */
	public int getUserPoints(UserIdentity id) {
		for(Player p : players) {
			if (p.getUserIdentity().equals(id)) {
				return p.getScore();
			}
		}
		return 0;
	}

	/**
	 * Returns all players which contains all results
	 * @return a List of Players
	 */
	public List<Player> getAllResults() {
		return this.players;
	}

	/**
	 * Returns a list of questions associated to this quiz
	 * @return a List of Questions
	 */
    public List<Question> getQuestions() {
        return this.questions;
    }

	/**
	 * Returns the current questions of this quiz
	 * @return a Questions
	 */
	public Question getCurrentQuestion(){
        if (currentQuestion < 0 || currentQuestion >= questions.size())
            return null;
        return questions.get(currentQuestion);
    }

	/**
	 * A method for answering questions.
	 * @param user the UserIdentity that answered
	 * @param artistName the answer they made
	 * @return true if the answer was correct, false otherwise
	 */
    public boolean answerQuestion(UserIdentity user, String artistName) {
	    for (Player p : players) {
		    if (p.getUserIdentity().equals(user)) {
			    return p.setAnswer(this.getCurrentQuestion(), artistName);
		    }
	    }
	    return false;
    }

	/**
	 * Returns the next questions of this quiz
	 * @return a Question or null if no more questions
	 */
	public Question getNextQuestion(){
        if (questions.size() == currentQuestion + 1)
            return null;
        return questions.get(++currentQuestion);
    }

	/**
	 * Returns the uuid of this quiz
	 * @return a String
	 */
	public String getUUID(){
        return uuid;
    }

	/**
	 * Returns the name of this quiz
	 * @return a String
	 */
    public String getName() {
        return name;
    }

}
