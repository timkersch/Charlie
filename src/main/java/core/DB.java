package core;

import javax.ejb.EJB;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;

/**
 * Created by jcber on 2016-03-07.
 */

@Named
@ApplicationScoped
public class DB {

    //@EJB
    //private TestCatalogue testCatalogue;
    @EJB
    private UserCatalogue userCatalogue;
    @EJB
    private QuizCatalogue quizCatalogue;

    public UserCatalogue getUserCatalogue() {
        return userCatalogue;
    }

    public QuizCatalogue getQuizCatalogue() {
        return quizCatalogue;
    }

    /*public TestCatalogue getTestCatalogue() {
        return testCatalogue;
    }*/

}
