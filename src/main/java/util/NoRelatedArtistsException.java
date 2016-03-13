package util;

/**
 * Created by: Tim Kerschbaumer
 * Project: Charlie
 * Date: 2016-03-13
 * Time: 21:11
 */
public class NoRelatedArtistsException extends RuntimeException {
	public NoRelatedArtistsException() {
		super();
	}

	public NoRelatedArtistsException(String message) {
		super(message);
	}
}
