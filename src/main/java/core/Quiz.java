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

public class Quiz extends AbstractEntity {
    private final List<Long> playerIds = new ArrayList<>();
    private final List<Question> questions = new ArrayList<>();
    private int currentQuestion;
    private Long ownerId;

    public Quiz(){
        super();
    }

    public Quiz(Long ownerId, List<Long> playerIds, List<Question> questions){
        this();
        this.ownerId = ownerId;
        this.playerIds.addAll(playerIds);
        this.questions.addAll(questions);
        this.currentQuestion = 0;
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
    
    public Question getCurrentQuestion(){
        return questions.get(currentQuestion);
    }
    
    public Question getNextQuestion(){
        return questions.get(currentQuestion++);
    }

}
