package core;

import com.google.appengine.repackaged.com.google.common.base.Flag;
import com.wrapper.spotify.models.Track;
import persistence.AbstractEntity;

import javax.persistence.*;
import java.io.Serializable;
import java.util.*;

/**
 * Created by jcber on 2016-03-04.
 */

@Entity
public class Quiz extends AbstractEntity {
    @ElementCollection
    private final List<Long> playerIds = new ArrayList<>();
    @ElementCollection
    private final List<String> trackIds = new ArrayList<>();
    @ElementCollection
    private final Map<String, Boolean> artistIds = new HashMap<String, Boolean>();
    private Long ownerId;

    public Quiz(){
        super();
    }

    public Quiz(Long ownerId, List<Long> playerIds, List<String> trackIds, Map<String, Boolean> artistIds){
        this();
        this.ownerId = ownerId;
        this.artistIds.putAll(artistIds);
        this.playerIds.addAll(playerIds);
        this.trackIds.addAll(trackIds);
    }

    public List<Long> getPlayerIds() {
        return playerIds;
    }

    public List<String> getTrackIds() {
        return trackIds;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public Map<String, Boolean> getArtistiIds() {
        return artistIds;
    }

}
