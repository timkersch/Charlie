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
	private final List<Question> questions = new ArrayList<>();

    private Long ownerId;

    public Quiz(){
        super();
    }

    public Quiz(Long ownerId, List<Long> playerIds, List<Question> questions){
        this();
        this.ownerId = ownerId;
        this.playerIds.addAll(playerIds);
	    this.questions.addAll(questions);
    }

    public List<Long> getPlayerIds() {
        return playerIds;
    }

    public Long getOwnerId() {
        return ownerId;
    }

	public List<Question> getQuestion() {
		return this.questions;
	}

}
