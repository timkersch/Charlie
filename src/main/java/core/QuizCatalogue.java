package core;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jcber on 2016-03-07.
 * This will be a in-memory storage for quizes. 
 * At this point quizes do not need to be stored in a database.
 */

public class QuizCatalogue {

    private final List<Quiz> quizes = new ArrayList<>();
    
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
    
    public void removeUserFromQuizes(UserIdentity user){
        for (int i = quizes.size() - 1; i >= 0; i--){
            Quiz quiz = quizes.get(i);
            if (quiz.getOwner().equals(user))
                quizes.remove(i);
            else if(quiz.getJoinedPlayers().contains(user))
                quiz.leavePlayer(user);
        }
    }
}
