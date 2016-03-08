package core;

import persistence.AbstractDAO;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Created by jcber on 2016-03-07.
 */

@Stateless
public class UserCatalogue extends AbstractDAO<UserIdentity, Long> {

    @PersistenceContext
    private EntityManager em;

    public UserCatalogue() {
        super(UserIdentity.class);
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
}
