package com.nextcut.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;

/**
 * Carrega automaticamente as variáveis do arquivo .env para o ambiente
 * do processo Java (System properties), permitindo que o backend rode
 * com um simples "mvn exec:java" sem precisar exportar variáveis manualmente.
 *
 * <p>Em produção (Railway/Render), as variáveis já estão no ambiente do SO,
 * então o .env não é necessário e é ignorado silenciosamente.</p>
 */
public final class EnvLoader {
    private EnvLoader() {
    }

    /**
     * Carrega o .env do diretório de trabalho atual.
     * Se o arquivo não existir (ex: produção), ignora silenciosamente.
     * Variáveis do .env NÃO sobrescrevem variáveis já definidas no SO.
     */
    public static void load() {
        var dotenv = Dotenv.configure()
            .ignoreIfMissing()
            .load();

        for (DotenvEntry entry : dotenv.entries()) {
            // Só define se a variável NÃO existir no ambiente do SO,
            // garantindo que variáveis de produção tenham prioridade
            if (System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        }
    }
}
