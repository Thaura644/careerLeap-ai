package com.leapai.backend.config;

import com.leapai.backend.model.User;

/** Holds the authenticated user for the duration of a request (set by AuthInterceptor). */
public final class UserContext {

    private static final ThreadLocal<User> CURRENT = new ThreadLocal<>();

    private UserContext() {}

    public static void set(User user) {
        CURRENT.set(user);
    }

    public static User get() {
        return CURRENT.get();
    }

    /** Throws if no authenticated user — call only from protected endpoints. */
    public static User require() {
        User user = CURRENT.get();
        if (user == null) {
            throw new IllegalStateException("No authenticated user in request context");
        }
        return user;
    }

    public static void clear() {
        CURRENT.remove();
    }
}
