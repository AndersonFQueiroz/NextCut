package com.nextcut.app;

/**
 * Mantido para compatibilidade com comandos antigos; delega para {@link App}.
 */
public final class Main {
    private Main() {
    }

    public static void main(String[] args) {
        App.main(args);
    }
}
