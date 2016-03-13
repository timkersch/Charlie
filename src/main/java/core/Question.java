package core;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.wrapper.spotify.models.Track;

import java.util.*;
import web.WebsocketServer;

/**
 * Created by: Tim Kerschbaumer
 * Project: SpotHoot
 * Date: 2016-03-10
 * Time: 10:31
 */
public class Question {

    private Track track;
    private final Map<String, Boolean> artistNames = new HashMap<>();

    public Question() {
        super();
    }

    /**
     * Create a questions
     *
     * @param track the track that this question is about
     * @param artistsIds a map of Artists that are the alternatives with
     * corresponding booleans telling if they are correct.
     */
    public Question(Track track, Map<String, Boolean> artistsIds) {
        this.track = track;
        this.artistNames.putAll(artistsIds);
    }

    /**
     * Returns all possible answers for this quiz and if they are true or not.
     *
     * @return a String, Boolean map of artists and whether they are correct or
     * not
     */
    public Map<String, Boolean> getArtistsIds() {
        return this.artistNames;
    }

    /**
     * Returns the trackid of this Questions
     *
     * @return a Track
     */
    public Track getTrackId() {
        return this.track;
    }

    /**
     * Returns true if the artis is the correct artist, otherwise false
     *
     * @param artistName the artist to be considered
     * @return true if it is the correct artist, otherwise false
     */
    public boolean answer(String artistName) {
        return artistNames.getOrDefault(artistName, Boolean.FALSE);
    }

    /**
     * Returns an shuffled arraylist of artists
     *
     * @return a List of artists that are the options for this questions
     */
    public List<String> getArtists() {
        List<String> artists = new ArrayList<>(artistNames.keySet());
        Collections.shuffle(artists);
        return artists;
    }

    /**
     * Returns the correct answer of this questions
     *
     * @return a String that is the correct artist name or null if no correct
     * artist is found
     */
    public String getCorrect() {
        for (String k : artistNames.keySet()) {
            if (artistNames.get(k)) {
                return k;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        return "Question[track: " + track.getName() + ", artistsLength: " + artistNames.size() + "]";
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        obj.addProperty("track_url", track.getUri());
        JsonArray array = new JsonArray();
        for (String s : getArtists()) {
            array.add(s);
        }
        obj.add("artists", array);
        return obj;
    }
}
