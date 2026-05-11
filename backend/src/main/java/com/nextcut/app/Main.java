package com.nextcut.app;

import com.nextcut.config.AppProperties;

public class Main {
    public static void main(String[] args) {
        var properties = AppProperties.fromEnvironment();
        AppFactory.create().start(properties.port());
    }
}
