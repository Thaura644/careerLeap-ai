package com.leapai.backend.config;

/** Thrown when an authenticated user lacks the entitlement required for an
 *  action (e.g. a free user attempting a Pro-gated practice problem). Mapped
 *  to HTTP 403 by {@link GlobalExceptionHandler}. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
