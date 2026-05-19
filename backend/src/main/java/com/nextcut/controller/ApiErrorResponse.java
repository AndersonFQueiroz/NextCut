package com.nextcut.controller;

public record ApiErrorResponse(boolean success, String error) {
    public static ApiErrorResponse of(String error) {
        return new ApiErrorResponse(false, error);
    }
}
