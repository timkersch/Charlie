package core;

import persistence.AbstractDAO;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Created by jcber on 2016-03-08.
 */

//@Stateless
public class TestCatalogue extends AbstractDAO<Test, Long> {

    //@PersistenceContext
    private EntityManager em;

    public TestCatalogue() {
        super(Test.class);
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
}
