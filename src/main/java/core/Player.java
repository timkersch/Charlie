package core;

import com.google.gson.JsonObject;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-11
 * Time: 15:27
 */
public class Player {

    private UserIdentity userIdentity;
    private Map<Question, String> answers = new HashMap<>();
    private int score = 0;
    private boolean isOwner = false;

    /**
     * Create a player
     *
     * @param userIdentity the user that is playing
     * @param isOwner if the user is the creator of the quiz
     */
    public Player(UserIdentity userIdentity, boolean isOwner) {
        this.userIdentity = userIdentity;
        this.isOwner = isOwner;
    }

    /**
     * Sets the answer of a question made by this user and updates the score
     *
     * @param q the question
     * @param answer the answer
     * @return true if the answer was correct, otherwise false
     */
    public boolean setAnswer(Question q, String answer) {
        if (!hasAnswered(q)) {
            answers.put(q, answer);
            if (q.getArtistsIds().getOrDefault(answer, false)) {
                score++;
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether the player has created i.e is the owner of this quiz
     *
     * @return a boolean
     */
    public boolean isOwner() {
        return this.isOwner;
    }

    /**
     * Returns the questions and answers of the player
     *
     * @return a map of questions and answers
     */
    public Map<Question, String> getAnswers() {
        return this.answers;
    }

    /**
     * Returns Whether or not the answer to a question is correctly answered or
     * not
     *
     * @param q the question
     * @return a boolean
     */
    public boolean getAnswerCorrect(Question q) {
        String answer = this.answers.get(q);
        return q.getArtistsIds().get(answer);
    }
    
    /**
     * Returns whether or not the question has been answered by this player
     * @param q the question
     * @return a boolean
     */
    public boolean hasAnswered(Question q) {
        return this.answers.containsKey(q);
    }

    /**
     * Return the score of a playee
     *
     * @return int - the score
     */
    public int getScore() {
        return this.score;
    }

    /**
     * Return the identity of a player
     *
     * @return UserIdentity
     */
    public UserIdentity getUserIdentity() {
        return this.userIdentity;
    }

    // Set the score for this player
    private void setScore(int score) {
        this.score = score;
    }

    public boolean equals(Object o) {
        return this.userIdentity.equals(o);
    }
    
    public JsonObject toJson(){
        JsonObject o = userIdentity.toJson();
        o.addProperty("points", score);
        return o;
    }

}
