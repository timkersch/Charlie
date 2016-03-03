/**
 * Created by jcber on 2016-03-01.
 */

import javax.enterprise.context.ApplicationScoped;
import javax.json.JsonObject;
import javax.json.spi.JsonProvider;
import javax.websocket.Session;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class SessionHandler {
    private int deviceId = 0;
    private final Set<UserSession> sessions = new HashSet<>();

    public void addSession(UserSession session) {
        sessions.add(session);
        /*for (Device device : devices) {
            JsonObject addMessage = createAddMessage(device);
            sendToSession(session, addMessage);
        }*/
    }

    public void removeSession(UserSession session) {
        sessions.remove(session);
    }

    public UserSession getUserSession(String sessionId) {
        for (UserSession session : sessions) {
            if (Objects.equals(session.getSession().getId(), sessionId)) {
                return session;
            }
        }
        return null;
    }

    public UserSession getUserSession(long userId){
        for (UserSession session : sessions) {
            if (session.getUser().getId() == userId) {
                return session;
            }
        }
        return null;
    }

    public void sendToAllConnectedSessions(JsonObject message) {
        for (UserSession session : sessions) {
            sendToSession(session, message);
        }
    }

    public void sendToSessions(Quiz quiz, JsonObject message){
        for (User user: quiz.getUsers()){
            this.sendToSession(this.getUserSession(user.getId()), message);
        }
    }

    public void sendToSession(UserSession session, JsonObject message) {
        try {
            session.getSession().getBasicRemote().sendText(message.toString());
        } catch (IOException ex) {
            sessions.remove(session);
            Logger.getLogger(SessionHandler.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    /*

    private JsonObject createAddMessage(Device device) {
        JsonProvider provider = JsonProvider.provider();
        JsonObject addMessage = provider.createObjectBuilder()
                .add("action", "add")
                .add("id", device.getId())
                .add("name", device.getName())
                .add("type", device.getType())
                .add("status", device.getStatus())
                .add("description", device.getDescription())
                .build();
        return addMessage;
    }

    public List getDevices() {
        return new ArrayList<>(devices);
    }

    public void addDevice(Device device) {
        device.setId(deviceId);
        devices.add(device);
        deviceId++;
        JsonObject addMessage = createAddMessage(device);
        sendToAllConnectedSessions(addMessage);
    }

    public void removeDevice(int id) {
        Device device = getDeviceById(id);
        if (device != null) {
            devices.remove(device);
            JsonProvider provider = JsonProvider.provider();
            JsonObject removeMessage = provider.createObjectBuilder()
                    .add("action", "remove")
                    .add("id", id)
                    .build();
            sendToAllConnectedSessions(removeMessage);
        }
    }

    public void toggleDevice(int id) {
        JsonProvider provider = JsonProvider.provider();
        Device device = getDeviceById(id);
        if (device != null) {
            if ("On".equals(device.getStatus())) {
                device.setStatus("Off");
            } else {
                device.setStatus("On");
            }
            JsonObject updateDevMessage = provider.createObjectBuilder()
                    .add("action", "toggle")
                    .add("id", device.getId())
                    .add("status", device.getStatus())
                    .build();
            sendToAllConnectedSessions(updateDevMessage);
        }
    }

    private Device getDeviceById(int id) {
        for (Device device : devices) {
            if (device.getId() == id) {
                return device;
            }
        }
        return null;
    }*/

}
