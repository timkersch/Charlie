package core;

import java.util.ArrayList;
import java.util.List;

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
    
    public Quiz getQuiz(UserIdentity user) {
        for (Quiz quiz : quizes){
            if (quiz.getOwner().equals(user) || quiz.getJoinedPlayers().contains(user))
                return quiz;
        }
        return null;
    }
}
