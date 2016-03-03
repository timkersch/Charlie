import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Created by jcber on 2016-03-03.
 */
public class DBContext {

    public DBContext() {
        try {
            Connection connection = DriverManager.getConnection("jdbc:derby:C:/Users/jcber/Documents/Github/SpotHoot/db;create=true");
            System.out.println("Connection created");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
