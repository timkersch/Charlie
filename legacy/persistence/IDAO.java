package persistence;

import java.util.List;

/**
 * Basic CRUD interface implemented by all DAO (Facade) classes 
 * @param <T> Type
 * @param <K> Primary key (id)
 */
public interface IDAO<T, K> {

    /**
     * Create
     * @param t the entity to be created
     */
    public void create(T t);

    /**
     * Delete
     * @param id the id of the entity to be deleted
     */
    public void delete(K id);

    /**
     * Update
     * @param t the entity to be updated
     */
    public void update(T t);

    /**
     * Find
     * @param id the id of the entity to be found
     * @return the entity or null if not found
     */
    public T find(K id);

    /**
     * Find all
     * @return the list of entities
     */
    public List<T> findAll();

    /**
     * Count all
     * @return the number of entites
     */
    public int count();
}
