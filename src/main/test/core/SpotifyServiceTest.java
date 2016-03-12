package core;

import com.wrapper.spotify.models.Artist;
import com.wrapper.spotify.models.SimplePlaylist;
import com.wrapper.spotify.models.Track;
import org.junit.Before;
import org.junit.Test;

import java.util.Arrays;
import java.util.Hashtable;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-12
 * Time: 13:16
 */
public class SpotifyServiceTest {
	SpotifyService s = new SpotifyService();
	String user = "tiimiz";
	String[] songs = {"57ay2J7PoNPKUGIncs3lHi", "4ycUbcT3euZ3ICarb23fQF", "0SVZV4iQ9Qi5mEpijs63v1",
			"0VwMJ5cpmKirULOuW321Zc", "1eq1wUnLVLg4pdEfx9kajC"};
	String[] playlists = {"7uqylp6NzurXY8TeLuJAwp", "4lgfWQz3pRy2oMVyKslxop", "4oYskMonMrG2veyspteerz"};

	@Before
	public void setUp() throws Exception {
		s.initTests();
	}

	@Test
	public void testGetUsersPlaylists() throws Exception {
		List<SimplePlaylist> sp = s.getUsersPlaylists(user);
		assertTrue(sp.size() == playlists.length);
		for (int i = 0; i < sp.size(); i++) {
			assertTrue(sp.get(i).getId().equals(playlists[i]));
		}
	}

	@Test
	public void testGetPlaylistSongs() throws Exception {
		List<Track> t = s.getPlaylistSongs(playlists[0], user);
		assertTrue(t.size() == songs.length);
		for (int i = 0; i < t.size(); i++) {
			assertTrue(t.get(i).getId().equals(songs[i]));
		}
	}

	@Test
	public void testGetArtistOptions() throws Exception {
		for (int i = 0; i < songs.length; i++) {
			Hashtable<String, Boolean> artists = s.getArtistOptions(songs[i]);
			String[] arts = artists.keySet().toArray(new String[artists.keySet().size()]);
			for (int j = 0; j < arts.length; j++) {
				if(arts[j].equals(s.getTracksArtist(songs[i]).getName())) {
					assertTrue(artists.get(arts[j]));
				} else {
					assertTrue(!artists.get(arts[j]));
				}
			}
		}
	}

	@Test
	public void testGetSimilarTracks() throws Exception {

	}

	@Test
	public void testGetTrackUrl() throws Exception {

	}
}