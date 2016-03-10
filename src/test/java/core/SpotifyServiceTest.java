package core;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-10
 * Time: 15:37
 */
public class SpotifyServiceTest {

	SpotifyService s;

	@Before
	public void setUp() throws Exception {
		s = new SpotifyService();
	}

	@After
	public void tearDown() throws Exception {

	}

	@Test
	public void testGetAuthorizeURL() throws Exception {
		System.out.println(s.getAuthorizeURL());
	}

	@Test
	public void testGetUsersPlaylists() throws Exception {

	}

	@Test
	public void testGetPlaylistSongs() throws Exception {

	}

	@Test
	public void testAddTracksToPlayList() throws Exception {

	}

	@Test
	public void testCreateQuizPlaylist() throws Exception {

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
	public void testGetUser() throws Exception {

	}

	@Test
	public void testRefreshAccessToken() throws Exception {

	}

	@Test
	public void testGetTrackUrl() throws Exception {

	}

	@Test
	public void testGetTrackUrl1() throws Exception {

	}

	@Test
	public void testSetTokens() throws Exception {

	}

	@Test
	public void testGetPlaylists() throws Exception {

	}
}