package br.com.healthplanner.back.model;

import org.springframework.data.annotation.Id;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
public class Doctor {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Nome é obrigatório.")
    private String name;
    @NotBlank(message = "CRM é obrigatório.")
    private String CRM;
    @NotBlank(message = "CPF é obrigatório")
    private String CPF;
    @NotBlank(message = "Email é obrigatório.")
    private String email;
    @NotBlank(message = "Endereço é obrigatório.")
    private String endereco;
    @NotBlank(message = "Senha é obrigatório.")
    private String senha;
}
