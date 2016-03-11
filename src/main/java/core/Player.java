package core;

import com.google.appengine.repackaged.com.google.common.base.Flag;

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

	public Player(UserIdentity userIdentity, boolean isOwner) {
		this.userIdentity = userIdentity;
		this.isOwner = isOwner;
	}

	public void setAnswer(Question q, String answer) {
		answers.put(q, answer);
		if (q.getArtistsIds().get(answer)) {
			score++;
		}
	}

	public boolean isOwner() {
		return this.isOwner;
	}

	public void setScore(int score) {
		this.score = score;
	}

	public Map<Question, String> getAnswers() {
		return this.answers;
	}

	public boolean getAnswerCorrect(Question q) {
		String answer = this.answers.get(q);
		return q.getArtistsIds().get(answer);
	}

	public int getScore() {
		return this.score;
	}

	public UserIdentity getUserIdentity() {
		return this.userIdentity;
	}

}
