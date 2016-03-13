package core;

import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;


/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-12
 * Time: 17:38
 */

public class QuizTest {
	/*
	Quiz q;
	SpotifyService s = new SpotifyService();
	String[] songs = {"57ay2J7PoNPKUGIncs3lHi", "4ycUbcT3euZ3ICarb23fQF", "0SVZV4iQ9Qi5mEpijs63v1",
			"0VwMJ5cpmKirULOuW321Zc", "1eq1wUnLVLg4pdEfx9kajC"};
	List<UserIdentity> ui;
	UserIdentity owner;
	Question q1;
	Question q2;
	
	@Before
	public void setUp() throws Exception {
		ui = new ArrayList<>();
		ui.add(new UserIdentity());
		ui.add(new UserIdentity());
		ui.add(new UserIdentity());

		List<Question> questions = new ArrayList<>();
		q1 = new Question(s.getTrack(songs[0]), s.getArtistOptions(songs[0]));
		q2 = new Question(s.getTrack(songs[1]), s.getArtistOptions(songs[1]));
		questions.add(q1);
		questions.add(q2);

		owner = new UserIdentity();

		q = new Quiz("quiz1", owner, ui, questions);
	}

	@Test
	public void testGetUnjoinedPlayers() throws Exception {
		assertTrue(ui.containsAll(q.getUnjoinedPlayers()));
	}

	@Test
	public void testGetJoinedPlayers() throws Exception {
		List<UserIdentity> u = q.getJoinedPlayers();
		assertTrue(u.get(0).equals(owner));
	}

	@Test
	public void testJoinPlayer() throws Exception {
		q.joinPlayer(ui.get(0));
		List<UserIdentity> u = q.getJoinedPlayers();
		assertTrue(u.size() == 2);
		assertTrue(u.get(1).equals(ui.get(0)));
	}

	@Test
	public void testLeavePlayer() throws Exception {
		q.joinPlayer(ui.get(0));
		List<UserIdentity> u = q.getJoinedPlayers();
		assertTrue(q.leavePlayer(u.get(1)));
		assertTrue(q.getJoinedPlayers().size() == 1);
		assertTrue(q.leavePlayer(u.get(0)));
		assertTrue(!q.leavePlayer(new UserIdentity()));
	}

	@Test
	public void testGetOwner() throws Exception {
		assertEquals(q.getOwner(), owner);
	}

	@Test
	public void testGetUserResults() throws Exception {
		assertNotNull(q.getUserResults(owner));
	}

	@Test
	public void testGetUserPoints() throws Exception {
		assertNotNull(q.getUserPoints(q.getOwner()));
	}

	@Test
	public void testGetPlayer() throws Exception {
		assertNotNull(q.getPlayer(q.getOwner()));
		assertNotNull(q.getPlayer(ui.get(0)));
	}

	@Test
	public void testGetAllResults() throws Exception {
		assertTrue(q.getNextQuestion().equals(q1));
		q.answerQuestion(q.getOwner(), q1.getCorrect());

		List<Player> results = q.getAllResults();
		for (Player p : results) {
			assertNotNull(p.getAnswerCorrect(q1));
		}
	}

	@Test
	public void testGetQuestions() throws Exception {
		List<Question> que = q.getQuestions();
		for(Question w : que) {
			assertTrue(w.equals(q1) || w.equals(q2));
		}
	}

	@Test
	public void testGetCurrentQuestion() throws Exception {
		assertTrue(q.getCurrentQuestion() == null);
		Question qq = q.getNextQuestion();
		assertTrue(q.getCurrentQuestion().equals(qq));
	}

	@Test
	public void testAnswerQuestion() throws Exception {
		assertTrue(q.getNextQuestion().equals(q1));
		assertTrue(q.answerQuestion(ui.get(0), q1.getCorrect()));
		assertTrue(q.getNextQuestion().equals(q2));
		assertTrue(!q.answerQuestion(ui.get(0), "wrong"));
	}

	@Test
	public void testGetNextQuestion() throws Exception {
		Question qq = q.getNextQuestion();
		assertTrue(qq.equals(q.getCurrentQuestion()));
		Question qqq = q.getNextQuestion();
		assertTrue(qqq.equals(q.getCurrentQuestion()));
		assertTrue(q.getNextQuestion() == null);
	}

	@Test
	public void testGetName() throws Exception {
		assertTrue(q.getName().equals("quiz1"));
	}*/

}
