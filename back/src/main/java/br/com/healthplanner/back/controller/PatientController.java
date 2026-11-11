package br.com.healthplanner.back.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = {"/pacientes", "/patients"})
public class PatientController {

    private final Map<Long, Paciente> patients = new ConcurrentHashMap<>();
    private final AtomicLong nextId = new AtomicLong(1L);

    @GetMapping
    public List<Paciente> listar() {
        return new ArrayList<>(patients.values());
    }

    @PostMapping
    public Paciente criar(@RequestBody Paciente paciente) {
        Long id = nextId.getAndIncrement();
        paciente.setId(id);
        patients.put(id, paciente);
        return paciente;
    }

    @PutMapping("/{id}")
    public Paciente atualizar(@PathVariable Long id, @RequestBody Paciente pacienteAtualizado) {
        if (!patients.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }

        Paciente atual = patients.get(id);
        atual.setNome(pacienteAtualizado.getNome());
        atual.setCpf(pacienteAtualizado.getCpf());
        atual.setDataNascimento(pacienteAtualizado.getDataNascimento());
        atual.setTelefone(pacienteAtualizado.getTelefone());
        atual.setEmail(pacienteAtualizado.getEmail());
        return atual;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!patients.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente não encontrado");
        }
        patients.remove(id);
        return ResponseEntity.noContent().build();
    }

    public static class Paciente {
        private Long id;
        private String nome;
        private String cpf;
        private String dataNascimento;
        private String telefone;
        private String email;

        public Paciente() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getCpf() {
            return cpf;
        }

        public void setCpf(String cpf) {
            this.cpf = cpf;
        }

        public String getDataNascimento() {
            return dataNascimento;
        }

        public void setDataNascimento(String dataNascimento) {
            this.dataNascimento = dataNascimento;
        }

        public String getTelefone() {
            return telefone;
        }

        public void setTelefone(String telefone) {
            this.telefone = telefone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
