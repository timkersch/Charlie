package util;

/**
 * Created by: Tim Kerschbaumer
 * Project: Charlie
 * Date: 2016-03-13
 * Time: 18:54
 */

/**
 * This class is used for the exception that happens when there are local songs in a playlist
 */
public class LocalSongsException extends RuntimeException {

	public LocalSongsException() {
		super();
	}

	public LocalSongsException(String message) {
		super(message);
	}

}
