package core;

import javax.ejb.EJB;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;

/**
 * Created by jcber on 2016-03-07.
 * This class gives access to the classes saved in the database and
 * in-memory saved data.
 */

@Named
@ApplicationScoped
public class DB {

    @EJB
    private UserCatalogue userCatalogue;
    
    private static final QuizCatalogue quizCatalogue = new QuizCatalogue();

    public UserCatalogue getUserCatalogue() {
        return userCatalogue;
    }

    public QuizCatalogue getQuizCatalogue() {
        return quizCatalogue;
    }

}
