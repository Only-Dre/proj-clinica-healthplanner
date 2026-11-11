package br.com.healthplanner.back.auth.dto;

public record LoginResponse(String token, UsuarioResponse usuario) {
}
