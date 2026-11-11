package br.com.healthplanner.back.auth.dto;

public record UsuarioResponse(Long id, String nome, String email, String perfil) {
}
