package com.civicpulse.civicpulse.exception;

/** Raised when an uploaded file cannot be used as an issue image. */
public class InvalidImageException extends RuntimeException {
    public InvalidImageException(String message) {
        super(message);
    }
}
