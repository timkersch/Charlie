package core;

import com.wrapper.spotify.models.Track;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-12
 * Time: 13:16
 */
public class SpotifyServiceTest {
	SpotifyService s = new SpotifyService();
	String playlistId = "7uqylp6NzurXY8TeLuJAwp";
	String[] songs = {"57ay2J7PoNPKUGIncs3lHi", "4ycUbcT3euZ3ICarb23fQF", "0SVZV4iQ9Qi5mEpijs63v1",
			"0VwMJ5cpmKirULOuW321Zc", "1eq1wUnLVLg4pdEfx9kajC"};

	@Before
	public void setUp() throws Exception {
		s.initTests();
	}

	@Test
	public void testGetUser() throws Exception {

	}

	@Test
	public void testGetUsersPlaylists() throws Exception {
		s.getUsersPlaylists();
		System.out.println("gotit");
	}

	@Test
	public void testGetPlaylistSongs() throws Exception {
		List<Track> t = s.getPlaylistSongs(playlistId, "tiimiz");
		assertTrue(t.size() == 5);
		for (int i = 0; i < t.size(); i++) {
			assertTrue(t.get(i).getId().equals(songs[i]));
		}
	}

	@Test
	public void testAddTracksToPlayList() throws Exception {

	}

	@Test
	public void testCreateAndPopulatePlaylist() throws Exception {

	}

	@Test
	public void testCreatePlaylist() throws Exception {

	}

	@Test
	public void testGetArtistOptions() throws Exception {

	}

	@Test
	public void testGetArtistOptions1() throws Exception {

	}

	@Test
	public void testGetSimilarTracks() throws Exception {

	}

	@Test
	public void testGetTrackUrl() throws Exception {

	}

	@Test
	public void testGetTrackUrl1() throws Exception {

	}
}