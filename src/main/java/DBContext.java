import java.sql.*;
import java.util.List;
import java.util.Properties;

/**
 * Created by jcber on 2016-03-03.
 */
public class DBContext {
    private static DBContext instance;
    private static Connection connection;

    private DBContext() {
        try {
            connection = DriverManager.getConnection(
                    "jdbc:google:mysql://your-project-id:your-instance-name/database",
                    "user", "password");
            System.out.println("Connection created");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static List<User> findUser(long id){
        // TODO
        return null;
    }

    public static List<User> findGroup(long id) {
        // TODO
        return null;
    }

    public static DBContext getInstance(){
        if (instance == null)
            return (instance = new DBContext());
        else
            return instance;
    }
}
