package persistence;

import java.io.Serializable;
import javax.persistence.*;

/**
 * Base class for all entities, defines id, equal etc
 */

@MappedSuperclass
public abstract class AbstractEntity implements Serializable {
    
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy  = GenerationType.AUTO)
    private Long id;

    public AbstractEntity() { }

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
    
    @Override
    public String toString(){
        return "Entity[id: " + id + "]";
    }

}
