package core;

import com.wrapper.spotify.models.SimplePlaylist;
import com.wrapper.spotify.models.Track;
import org.junit.Before;
import org.junit.Test;

import java.util.Hashtable;
import java.util.List;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

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
	public void testRandomInt() throws Exception {
		int rand = s.randomInt(1, 1);
		assertTrue(rand == 1);
		rand = s.randomInt(0, 1);
		assertTrue(rand == 0 || rand == 1);
		rand = s.randomInt(0, 100);
		assertTrue(rand >= 0 && rand <= 100);
		rand = s.randomInt(-100, 0);
		assertTrue(rand >= -100 && rand <= 0);
		rand = s.randomInt(-100, 100);
		assertTrue(rand >= -100 && rand <= 100);

		try {
			rand = s.randomInt(1, 0);
			// If this passed
			assertTrue(false);
		} catch (IllegalArgumentException e) {
			assertTrue(true);
		}
	}

	@Test
	public void testGetUsersPlaylists() throws Exception {
		List<SimplePlaylist> sp = s.getUsersPlaylists(user);
		try {
			assertNotNull(sp);
		} catch (AssertionError e) {
			System.out.println("Users playlist is null");
			throw new AssertionError();
		}

		try {
			assertTrue(sp.size() == playlists.length);
		} catch (AssertionError e) {
			System.out.println("The lengths do not match");
			throw new AssertionError();
		}
		for (int i = 0; i < sp.size(); i++) {
			try {
				assertTrue(sp.get(i).getId().equals(playlists[i]));
			} catch (AssertionError e) {
				System.out.println("Platlist ids don't match");
				throw new AssertionError();
			}
		}
	}

	@Test
	public void testGetPlaylistSongs() throws Exception {
		List<Track> t = s.getPlaylistSongs(playlists[0], user);
		try {
			assertNotNull(t);
		} catch (AssertionError e) {
			System.out.println("Tracks list is null");
			throw new AssertionError();
		}

		for (int i = 0; i < t.size(); i++) {
			try {
				assertTrue(t.get(i).getId().equals(songs[i]));
			} catch (AssertionError e) {
				System.out.println("Songs ids dont match");
				throw new AssertionError();
			}
		}
	}

	@Test
	public void testGetArtistOptions() throws Exception {
		for (int i = 0; i < songs.length; i++) {
			Hashtable<String, Boolean> artists = s.getArtistOptions(songs[i]);
			try {
				assertNotNull(artists);
			} catch (AssertionError e) {
				System.out.println("artists map is null");
				throw new AssertionError();
			}

			String[] arts = artists.keySet().toArray(new String[artists.keySet().size()]);
			for (int j = 0; j < arts.length; j++) {
				if(arts[j].equals(s.getTracksArtist(songs[i]).getName())) {
					try {
						assertTrue(artists.get(arts[j]));
					} catch (AssertionError e) {
						System.out.println("Correct artist is not true in map");
						throw new AssertionError();
					}
				} else {
					try {
						assertTrue(!artists.get(arts[j]));
					} catch (AssertionError e) {
						System.out.println("Wrong artist is not false in map");
						throw new AssertionError();
					}
				}
			}
		}
	}

	@Test
	public void testGetSimilarTracks() throws Exception {
		// This will eat up the requests from spotify
		for (int i = 0; i < playlists.length; i++) {
			Thread.sleep(3000);

			List<Track> playlistSongs = s.getPlaylistSongs(playlists[i], user);
			try {
				assertNotNull(playlistSongs);
			} catch (AssertionError e) {
				System.out.println("Playlistsongs is null");
				throw new AssertionError();
			}

			Thread.sleep(3000);

			List<Track> similarTracks = s.getSimilarTracks(playlistSongs, playlistSongs.size(), "SE");
			try {
				assertNotNull(similarTracks);
			} catch (AssertionError e) {
				System.out.println("Similartracks is null");
				throw new AssertionError();
			}

			for(Track t : similarTracks) {
				// So that rate limit does not exceed
				Thread.sleep(2500);

				try {
					assertNotNull(t);
				} catch (AssertionError e) {
					System.out.println("Similar track is null");
					throw new AssertionError();
				}

				try {
					assertTrue(!playlistSongs.contains(t));
				} catch(AssertionError e) {
					System.out.println("Failed: " + t + " in both playlists");
					throw new AssertionError();
				}

				try {
					assertTrue(s.getTrackUrl(t).equals(t.getPreviewUrl()));
				} catch (AssertionError e) {
					System.out.println("Failed: " + t + " has another previewUrl");
					throw new AssertionError();
				}

				try {
					assertTrue(!s.getTrackUrl(t).equals("null"));
				} catch (AssertionError e) {
					System.out.println("Failed: " + t + " has url string null");
					throw new AssertionError();
				}

				try {
					assertTrue(!s.getTrackUrl(t).equals(""));
				} catch (AssertionError e) {
					System.out.println("Failed: " + t + " has url empty");
					throw new AssertionError();
				}

				try {
					assertTrue(s.getTrackUrl(t) != null);
				} catch (AssertionError e) {
					System.out.println("Failed: " + t + " has url null");
					throw new AssertionError();
				}
			}
		}
	}
}