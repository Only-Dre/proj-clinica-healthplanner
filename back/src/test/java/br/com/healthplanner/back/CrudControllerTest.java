package br.com.healthplanner.back;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CrudControllerTest {

    @LocalServerPort
    private int port;

    @Test
    void deveGerenciarMedico() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest criar = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/medicos"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"nome\":\"Dr. João\",\"especialidade\":\"Cardiologia\",\"crm\":\"12345/MG\",\"email\":\"joao@clinica.com\",\"telefone\":\"(31)99999-0000\",\"endereco\":\"Rua A, 10\"}"))
                .build();

        HttpResponse<String> respostaCriacao = client.send(criar, HttpResponse.BodyHandlers.ofString());
        assertThat(respostaCriacao.statusCode()).isEqualTo(200);
        assertThat(respostaCriacao.body()).contains("Dr. João");

        HttpRequest listar = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/medicos"))
                .GET()
                .build();

        HttpResponse<String> respostaLista = client.send(listar, HttpResponse.BodyHandlers.ofString());
        assertThat(respostaLista.statusCode()).isEqualTo(200);
        assertThat(respostaLista.body()).contains("Dr. João");
    }

    @Test
    void deveGerenciarPaciente() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest criar = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/pacientes"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"nome\":\"Maria\",\"cpf\":\"123.456.789-00\",\"dataNascimento\":\"1995-07-15\",\"telefone\":\"(31)98888-1111\",\"email\":\"maria@email.com\"}"))
                .build();

        HttpResponse<String> respostaCriacao = client.send(criar, HttpResponse.BodyHandlers.ofString());
        assertThat(respostaCriacao.statusCode()).isEqualTo(200);
        assertThat(respostaCriacao.body()).contains("Maria");

        HttpRequest listar = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + "/pacientes"))
                .GET()
                .build();

        HttpResponse<String> respostaLista = client.send(listar, HttpResponse.BodyHandlers.ofString());
        assertThat(respostaLista.statusCode()).isEqualTo(200);
        assertThat(respostaLista.body()).contains("Maria");
    }
}
