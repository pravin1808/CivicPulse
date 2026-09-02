package com.civicpulse.civicpulse.exception;

/** Raised when a valid image cannot be persisted to the image directory. */
public class ImageStorageException extends RuntimeException {
    public ImageStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
