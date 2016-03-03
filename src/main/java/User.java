import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by jcber on 2016-03-03.
 */

@Entity
public class User {
    private String name;
    @ManyToMany(cascade = CascadeType.ALL)
    private Map<Long, List<User>> groups;

    public User(String name) {
        this.name = name;
        this.groups = new HashMap<>();
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName(){
        return this.name;
    }

    public void addGroup(List<User> group) {

    }

    public void removeGroup(Long id) {
        groups.remove(id);
    }
}
