package com.nextcut.model;

public record OtpVerifyRequest(String clientName, String clientPhone, String otpCode) {
}
