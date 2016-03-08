package core;

import persistence.AbstractEntity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.io.Serializable;

/**
 * Created by jcber on 2016-03-08.
 */

//@Entity
public class Test implements Serializable {//extends AbstractEntity {

    //@Id
    //@GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private int data;

    public Test(){

    }

    public Test(Long id){
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

}
