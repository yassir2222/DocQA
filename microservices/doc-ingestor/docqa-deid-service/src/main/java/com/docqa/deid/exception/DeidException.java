package com.docqa.deid.exception;

public class DeidException extends RuntimeException {
    public DeidException(String message) {
        super(message);
    }

    public DeidException(String message, Throwable cause) {
        super(message, cause);
    }
}