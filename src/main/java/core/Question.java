package core;

import com.wrapper.spotify.models.Track;

import javax.json.spi.JsonProvider;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-10
 * Time: 10:31
 */

public class Question {
	private Track track;
	private final Map<String, Boolean> artistNames = new HashMap<>();
        private static final JsonProvider PROVIDER = JsonProvider.provider();

	public Question() {
            super();
	}

	public Question(Track track, Map<String, Boolean> artistsIds) {
            this.track = track;
            this.artistNames.putAll(artistsIds);
	}

	public Map<String, Boolean> getArtistsIds() {
            return this.artistNames;
	}

	public Track getTrackId() {
            return this.track;
	}
        
        public boolean answer(String artistName) {
            return artistNames.getOrDefault(artistName, Boolean.FALSE);
        }

        public List<String> getArtists(){
            return new ArrayList<>(artistNames.keySet());
        }
        
        @Override
        public String toString(){
            return "Question[track: " + track.getName() + ", artistsLength: " + artistNames.size() + "]";
        }
}
