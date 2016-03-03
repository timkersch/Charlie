import java.net.URL;
import java.util.List;

/**
 * Created by jcber on 2016-03-04.
 */
public class Quiz {
    private long id;
    private List<User> users;
    private List<URL> songs;

    public Quiz(long id, List<User> users){
        this.id = id;
        this.users = users;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public long getId() {
        return id;
    }

    public List<User> getUsers() {
        return users;
    }
}
