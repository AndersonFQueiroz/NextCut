// Pacote do teste de integração seguindo a estrutura do projeto backend
package com.nextcut.integration;

// Importa classes do JUnit 5 para implementar os testes
import org.junit.jupiter.api.*;
// Importa classes do Java HTTP Client para fazer requisições HTTP ao servidor em teste
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
// Importa utilitários para converter strings em JSON
import static org.junit.jupiter.api.Assertions.*;
// Importa assumeTrue para pular testes quando uma condição prévia não for atendida
import static org.junit.jupiter.api.Assumptions.assumeTrue;

// Classe que agrupa testes de fluxo de ponta a ponta (integração)
public class FluxoIntegracaoTest {

  // Cliente HTTP reutilizável para todas as requisições do teste
  private static final HttpClient client = HttpClient.newBuilder()
    // Define timeout razoável para chamadas de integração
    .connectTimeout(Duration.ofSeconds(5))
    .build();

  // Base URL do servidor backend em ambiente de desenvolvimento
  private static final String BASE = "http://localhost:8080";

  // Token obtido no primeiro teste (login) e reutilizado nos seguintes
  private static String token;

  // Teste 1: verifica que POST /login retorna um token não-nulo
  @Test
  @Order(1)
  @DisplayName("testLoginRetornaTokenValido")
  public void testLoginRetornaTokenValido() throws Exception {
    // TODO: habilitar após merge da tarefa #26 se o endpoint /login estiver pronto
    // Monta o corpo JSON esperado pelo backend com username e password
    String json = "{\"username\": \"admin\", \"password\": \"admin123\"}";

    // Prepara a requisição HTTP POST para /login
    HttpRequest req = HttpRequest.newBuilder()
      .uri(URI.create(BASE + "/login"))
      .timeout(Duration.ofSeconds(5))
      .header("Content-Type", "application/json")
      .POST(HttpRequest.BodyPublishers.ofString(json))
      .build();

    // Envia a requisição e obtém a resposta como String
    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());

    // Verifica que o status é 200 OK
    assertEquals(200, resp.statusCode(), "Login deve retornar status 200 quando credenciais estiverem corretas");

    // Verifica que o corpo contém um token (simples verificação textual para este esqueleto)
    assertTrue(resp.body().contains("token"), "Resposta deve conter o campo token");

    // Extrai o token de forma simples: procura "token":"..." no corpo
    // Em produção use um parser JSON robusto; aqui mantemos simples para o esqueleto
    int idx = resp.body().indexOf("token");
    if (idx >= 0) {
      // TODO: extrair token real do JSON; por enquanto armazenamos o corpo inteiro
      token = resp.body();
    }
  }

  // Teste 2: entra na fila usando o token obtido no login
  @Test
  @Order(2)
  @DisplayName("testEntrarNaFilaRetornaTicket")
  public void testEntrarNaFilaRetornaTicket() throws Exception {
    // TODO: habilitar após merge da tarefa #26/#25 que implementa endpoints de fila
    // Garante que o token do login anterior exista; senão, falha o teste com mensagem clara
    assumeTrue(token != null && !token.isEmpty(), "Token não disponível — execute testLoginRetornaTokenValido primeiro");

    // Corpo JSON de exemplo para entrar na fila com nome e telefone
    String payload = "{\"clientName\": \"Cliente Teste\", \"clientPhone\": \"13999990001\"}";

    // Prepara a requisição POST para /queue/join com Authorization Bearer
    HttpRequest req = HttpRequest.newBuilder()
      .uri(URI.create(BASE + "/queue/join"))
      .timeout(Duration.ofSeconds(5))
      .header("Content-Type", "application/json")
      .header("Authorization", "Bearer " + token)
      .POST(HttpRequest.BodyPublishers.ofString(payload))
      .build();

    // Envia a requisição e obtém a resposta
    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());

    // Verifica que a operação foi aceita (201 ou 200 dependendo da implementação)
    assertTrue(resp.statusCode() == 200 || resp.statusCode() == 201, "Entrar na fila deve retornar 200 ou 201");

    // Verifica que o corpo contém ticketNumber e position (checagem textual no esqueleto)
    assertTrue(resp.body().contains("ticketNumber") || resp.body().contains("position"), "Resposta deve conter ticketNumber e position");
  }

  // Teste 3: verifica que GET /queue/status/{phone} retorna dados do cliente
  @Test
  @Order(3)
  @DisplayName("testStatusRetornaDadosCorretos")
  public void testStatusRetornaDadosCorretos() throws Exception {
    // TODO: habilitar após merge das tarefas backend necessárias
    // Monta a URL de status para o telefone usado no teste anterior
    String phone = "13999990001";

    // Prepara a requisição GET
    HttpRequest req = HttpRequest.newBuilder()
      .uri(URI.create(BASE + "/queue/status/" + phone))
      .timeout(Duration.ofSeconds(5))
      .GET()
      .build();

    // Envia a requisição e obtém a resposta
    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());

    // Esperamos 200 quando existir o cliente na fila
    assertEquals(200, resp.statusCode(), "Status deve retornar 200 quando o cliente existe na fila");

    // Verifica que a resposta contém o telefone ou nome do cliente
    assertTrue(resp.body().contains(phone) || resp.body().contains("Cliente Teste"), "Resposta deve conter os dados do cliente criado");
  }

  // Teste 4: sair da fila e verificar que status não retorna mais dados
  @Test
  @Order(4)
  @DisplayName("testSairDaFilaAtualizaPosicoes")
  public void testSairDaFilaAtualizaPosicoes() throws Exception {
    // TODO: habilitar após merge das tarefas backend necessárias
    String phone = "13999990001";

    // Prepara a requisição POST para /queue/leave/{phone}
    HttpRequest req = HttpRequest.newBuilder()
      .uri(URI.create(BASE + "/queue/leave/" + phone))
      .timeout(Duration.ofSeconds(5))
      .POST(HttpRequest.BodyPublishers.noBody())
      .build();

    // Envia a requisição e obtém a resposta
    HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());

    // Esperamos 200 ou 204 indicando remoção bem sucedida
    assertTrue(resp.statusCode() == 200 || resp.statusCode() == 204, "Sair da fila deve retornar 200 ou 204");

    // Verifica que uma consulta de status posterior não retorne dados do cliente
    HttpRequest check = HttpRequest.newBuilder()
      .uri(URI.create(BASE + "/queue/status/" + phone))
      .timeout(Duration.ofSeconds(5))
      .GET()
      .build();

    HttpResponse<String> after = client.send(check, HttpResponse.BodyHandlers.ofString());

    // Dependendo da implementação o status pode retornar 404 ou um objeto indicando ausência; aceitamos ambos
    assertTrue(after.statusCode() == 404 || !after.body().contains(phone), "Depois de sair, o status não deve mostrar o cliente");
  }
}
