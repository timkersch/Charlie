
package persistence;

import java.io.Serializable;
import java.util.UUID;
import javax.persistence.*;

/**
 * Base class for all entities, defines id, equal etc
 *   
 * The below implementations can be disputed
 * - Using surrogate or natural keys?
 * - No id before saved to database, problems with equals (storing in Sets)
 * - See https://community.jboss.org/wiki/EqualsAndHashCode
 * 
                  *** Nothing to do here ***

 * @author hajo
 */

@MappedSuperclass
public abstract class AbstractEntity implements Serializable {
    
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy  = GenerationType.AUTO)
    private Long id;

    public AbstractEntity() {
        //this.id = UUID.randomUUID().toString();
    }

    public Long getId(){
        return id;
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (!(obj instanceof AbstractEntity)) {
            return false;
        }
        AbstractEntity other = (AbstractEntity) obj;
        return getId().equals(other.getId());
    }

}
