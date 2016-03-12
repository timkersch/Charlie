package core;

import com.wrapper.spotify.models.Track;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-12
 * Time: 17:38
 */
public class PlayerTest {

	SpotifyService s = new SpotifyService();
	String[] songs = {"57ay2J7PoNPKUGIncs3lHi", "4ycUbcT3euZ3ICarb23fQF", "0SVZV4iQ9Qi5mEpijs63v1",
			"0VwMJ5cpmKirULOuW321Zc", "1eq1wUnLVLg4pdEfx9kajC"};
	Player p1;
	Player p2;
	List<Track> similarTracks;
	Map<String, Boolean> options1;
	Map<String, Boolean> options2;
	Question q1;
	Question q2;


	@Before
	public void setUp() throws Exception {
		s.initTests();
		p1 = new Player(new UserIdentity(), false);
		p2 = new Player(new UserIdentity(), true);
		similarTracks = s.getSimilarTracks(s.getTracks(songs), 2, "SE");
		options1 = s.getArtistOptions(similarTracks.get(0));
		options2 = s.getArtistOptions(similarTracks.get(1));
		q1 = new Question(similarTracks.get(0), options1);
		q2 = new Question(similarTracks.get(1), options2);
	}

	@Test
	public void testSetAnswer() throws Exception {
		assertTrue(!p1.setAnswer(q1, ""));
		for (String s : options1.keySet()) {
			if (options1.get(s)) {
				assertTrue(p1.setAnswer(q1, s));
			} else {
				assertTrue(!p1.setAnswer(q1, s));
			}
		}

	}

	@Test
	public void testIsOwner() throws Exception {
		assertTrue(!p1.isOwner());
		assertTrue(p2.isOwner());
	}

	@Test
	public void testGetAnswers() throws Exception {
		assertNotNull(p1.getAnswers());
		assertNotNull(p2.getAnswers());

		String ans1 = "";
		String ans2 = "";

		for (String s : options1.keySet()) {
			if (options1.get(s)) {
				ans1 = s;
				p1.setAnswer(q1, s);
				break;
			}
		}

		for (String s : options2.keySet()) {
			if (!options2.get(s)) {
				ans2 = s;
				p1.setAnswer(q2, s);
				break;
			}
		}

		Map<Question, String> answers = p1.getAnswers();
		assertTrue(answers.get(q1).equals(ans1));
		assertTrue(answers.get(q2).equals(ans2));

	}

	@Test
	public void testGetAnswerCorrect() throws Exception {
		for (String s : options1.keySet()) {
			if (options1.get(s)) {
				p1.setAnswer(q1, s);
				break;
			}
		}

		for (String s : options2.keySet()) {
			if (!options2.get(s)) {
				p1.setAnswer(q2, s);
				break;
			}
		}

		assertTrue(p1.getAnswerCorrect(q1));
		assertTrue(!p1.getAnswerCorrect(q2));
	}

	@Test
	public void testGetScore() throws Exception {
		for (String s : options1.keySet()) {
			if (options1.get(s)) {
				p1.setAnswer(q1, s);
				break;
			}
		}

		for (String s : options2.keySet()) {
			if (!options2.get(s)) {
				p1.setAnswer(q2, s);
				break;
			}
		}

		assertTrue(p1.getScore() == 1);
		assertTrue(p2.getScore() == 0);
	}

}