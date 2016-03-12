

import core.DB;
import core.UserIdentity;
import java.util.List;
import javax.enterprise.inject.Default;
import javax.enterprise.inject.Produces;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.UserTransaction;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.shrinkwrap.api.Archive;
import org.jboss.shrinkwrap.api.ShrinkWrap;
import org.jboss.shrinkwrap.api.asset.EmptyAsset;
import org.jboss.shrinkwrap.api.spec.WebArchive;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.assertTrue;

/**
 * Testing the persistence layer
 */

@RunWith(Arquillian.class)
public class TestUserPersistence {

    @Inject
    DB db;

    @Inject
    UserTransaction utx;  // This is not an EJB so have to handle transactions
    
    @Deployment
    public static Archive<?> createDeployment() {
        return ShrinkWrap.create(WebArchive.class, "spothoot.war")
                // Add all classes
                .addPackage("core")
                // This will add test-persitence.xml as persistence.xml (renamed)
                // in folder META-INF, see Files > jpa_managing > target > arquillian
                .addAsResource("test-persistence.xml", "META-INF/persistence.xml")
                // Must have for CDI to work
                .addAsWebInfResource(EmptyAsset.INSTANCE, "beans.xml");

    }

    @Before  // Run before each test
    public void before() throws Exception {
        clearAll();
    }

    @Test
    public void testPersistAUser() throws Exception {
        UserIdentity user = UserIdentity.createDummyUser();
        db.getUserCatalogue().create(user);
        List<UserIdentity> users = db.getUserCatalogue().findAll();
        assertTrue(users.size() > 0);
        assertTrue(users.get(0).getUser().getName().equals(user.getUser().getName()));
    }
    
    @Test
    public void testUserGetByName() throws Exception {
        UserIdentity user = UserIdentity.createDummyUser();
        db.getUserCatalogue().create(user);
        UserIdentity userByName = db.getUserCatalogue().getByName("dummy");
        assertTrue(userByName != null);
        assertTrue(userByName.getUser().getName().equals(user.getUser().getName()));
    }
    
    @Test
    public void testUserFindAllAndCount() throws Exception {
        int i = 0;
        for (; i < 5; i++) {
            UserIdentity user = UserIdentity.createDummyUser();
            db.getUserCatalogue().create(user);
        }
        List<UserIdentity> users = db.getUserCatalogue().findAll();
        int count = db.getUserCatalogue().count();
        assertTrue(users.size() == i);
        assertTrue(count == i);
    }
    
    @After  // Run before each test
    public void after() throws Exception {
        clearAll();
    }
    
    // Need a standalone em to remove testdata between tests
    // No em accessible from interfaces
    @PersistenceContext(unitName = "db_test")
    @Produces
    @Default
    EntityManager em;

    // Order matters
    private void clearAll() throws Exception {  
        utx.begin();  
        em.joinTransaction();
        em.createQuery("delete from UserIdentity").executeUpdate();
        utx.commit();
    }

}
