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
@RequestMapping(path = {"/medicos", "/doctors"})
public class DoctorController {

    private final Map<Long, Medico> doctors = new ConcurrentHashMap<>();
    private final AtomicLong nextId = new AtomicLong(1L);

    @GetMapping
    public List<Medico> listar() {
        return new ArrayList<>(doctors.values());
    }

    @PostMapping
    public Medico criar(@RequestBody Medico medico) {
        Long id = nextId.getAndIncrement();
        medico.setId(id);
        doctors.put(id, medico);
        return medico;
    }

    @PutMapping("/{id}")
    public Medico atualizar(@PathVariable Long id, @RequestBody Medico medicoAtualizado) {
        if (!doctors.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado");
        }

        Medico atual = doctors.get(id);
        atual.setNome(medicoAtualizado.getNome());
        atual.setEspecialidade(medicoAtualizado.getEspecialidade());
        atual.setCrm(medicoAtualizado.getCrm());
        atual.setEmail(medicoAtualizado.getEmail());
        atual.setTelefone(medicoAtualizado.getTelefone());
        atual.setEndereco(medicoAtualizado.getEndereco());
        return atual;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!doctors.containsKey(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico não encontrado");
        }
        doctors.remove(id);
        return ResponseEntity.noContent().build();
    }

    public static class Medico {
        private Long id;
        private String nome;
        private String especialidade;
        private String crm;
        private String email;
        private String telefone;
        private String endereco;

        public Medico() {
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

        public String getEspecialidade() {
            return especialidade;
        }

        public void setEspecialidade(String especialidade) {
            this.especialidade = especialidade;
        }

        public String getCrm() {
            return crm;
        }

        public void setCrm(String crm) {
            this.crm = crm;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getTelefone() {
            return telefone;
        }

        public void setTelefone(String telefone) {
            this.telefone = telefone;
        }

        public String getEndereco() {
            return endereco;
        }

        public void setEndereco(String endereco) {
            this.endereco = endereco;
        }
    }
}
