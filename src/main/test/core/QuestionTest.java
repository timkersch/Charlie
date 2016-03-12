package core;

import com.wrapper.spotify.models.Track;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.*;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-12
 * Time: 17:38
 */
public class QuestionTest {
	SpotifyService s = new SpotifyService();
	String[] songs = {"57ay2J7PoNPKUGIncs3lHi", "4ycUbcT3euZ3ICarb23fQF", "0SVZV4iQ9Qi5mEpijs63v1",
			"0VwMJ5cpmKirULOuW321Zc", "1eq1wUnLVLg4pdEfx9kajC"};
	Question q;
	List<Track> similarTracks;
	Map<String, Boolean> similarArtists;
	String trackid;
	
	@Before
	public void setUp() throws Exception {
		s.initTests();
		similarTracks = s.getSimilarTracks(s.getTracks(songs), 1, "SE");
		trackid = similarTracks.get(0).getId();
		similarArtists = s.getArtistOptions(similarTracks.get(0));
		q = new Question(similarTracks.get(0), similarArtists);
	}

	@Test
	public void testGetArtistsIds() throws Exception {
		assertEquals(similarArtists, q.getArtistsIds());
	}

	@Test
	public void testGetTrackId() throws Exception {
		assertTrue(trackid.equals(q.getTrackId().getId()));
	}

	@Test
	public void testAnswer() throws Exception {
		for (String s : similarArtists.keySet()) {
			if (similarArtists.get(s)) {
				assertTrue(q.answer(s));
			} else {
				assertTrue(!q.answer(s));
			}
		}
	}

	@Test
	public void testGetArtists() throws Exception {
		Set<String> keyset = similarArtists.keySet();
		List<String> artists = q.getArtists();
		for (String a : artists) {
			assertTrue(keyset.contains(a));
		}
	}

	@Test
	public void testGetCorrect() throws Exception {
		assertNotNull(q.getCorrect());
		for (String k : similarArtists.keySet()) {
			if (similarArtists.get(k)) {
				assertTrue(k.equals(q.getCorrect()));
				break;
			}
		}
	}

}