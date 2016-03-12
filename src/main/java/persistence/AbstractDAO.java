package persistence;

import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

/**
 * Base class for any persisting collection DAO = Data access object (also
 * called a Facade)
 *
 *   *** TODO Implement all methods ***
 *
 * @param <T> Type
 * @param <K> Primary key (id)
 * @author hajo
 */
public abstract class AbstractDAO<T, K> implements IDAO<T, K> {

    private final Class<T> clazz;

    // To be overridden by subclasses
    protected abstract EntityManager getEntityManager();

    protected AbstractDAO(Class<T> clazz) {
        this.clazz = clazz;
    }

    @Override
    public void create(T t) {
       getEntityManager().persist(t);
    }

    @Override
    public void delete(K id) {
        T t = getEntityManager().getReference(clazz,id);
        getEntityManager().remove(t);
    }

    @Override
    public void update(T t) {
        getEntityManager().merge(t);
    }

    @Override
    public T find(K id) {
        return getEntityManager().find(clazz,id);
    }

    @Override
    public List<T> findAll() {
        TypedQuery<T> q = getEntityManager().createQuery("select t from " + clazz.getSimpleName() + " t", clazz);
        return q.getResultList();
    }

    @Override
    public int count() {
        Long n = getEntityManager().createQuery("select count(t) from " + clazz.getSimpleName() + " t", Long.class).getSingleResult();
        return n.intValue();
    }

}
