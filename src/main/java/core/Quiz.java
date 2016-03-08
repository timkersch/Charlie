package core;

import com.wrapper.spotify.models.Track;
import persistence.AbstractEntity;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Created by jcber on 2016-03-04.
 */

@Entity
public class Quiz extends AbstractEntity {
    @ElementCollection
    private final List<Long> playerIds = new ArrayList<>();
    @ElementCollection
    private final List<String> trackIds = new ArrayList<>();
    private Long ownerId;

    public Quiz(){
        super();
    }

    public Quiz(Long ownerId, List<Long> playerIds, List<String> trackIds){
        this();
        this.ownerId = ownerId;
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

}
