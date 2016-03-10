package core;

import com.google.appengine.repackaged.com.google.common.base.Flag;
import persistence.AbstractEntity;

import javax.persistence.ElementCollection;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-10
 * Time: 10:31
 */

public class Question extends AbstractEntity {
	private String trackId;
	private final Map<String, Boolean> artistsIds = new HashMap<String, Boolean>();

	public Question() {
            super();
	}

	public Question(String trackId, Map<String, Boolean> artistsIds) {
            this.trackId = trackId;
            this.artistsIds.putAll(artistsIds);
	}

	public Map<String, Boolean> getArtistsIds() {
            return this.artistsIds;
	}

	public String getTrackId() {
            return this.trackId;
	}

}
