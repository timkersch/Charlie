package core;

import java.util.ArrayList;
import java.util.List;
import persistence.AbstractDAO;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Created by jcber on 2016-03-07.
 */

public class QuizCatalogue {

    private List<Quiz> quizes = new ArrayList<>();
    
    public void addQuiz(Quiz quiz){
        quizes.add(quiz);
    }
    
    public Quiz findQuiz(String quizId){
        for (Quiz quiz : quizes) {
            if (quiz.getUUID().equals(quizId))
                return quiz;
        }
        return null;
    }
    
    public List<Quiz> getQuizes(){
        return quizes;
    }
}
