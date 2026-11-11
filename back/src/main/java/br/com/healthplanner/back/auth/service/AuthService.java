package br.com.healthplanner.back.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.com.healthplanner.back.auth.config.JwtUtil;
import br.com.healthplanner.back.auth.dto.LoginResponse;
import br.com.healthplanner.back.auth.dto.UsuarioResponse;

@Service
public class AuthService {

    private static final String EMAIL_VALIDO = "recepcao@clinica.com";
    private static final String SENHA_VALIDA = "clinica123";

    private final JwtUtil jwtUtil;

    public AuthService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse autenticar(String email, String senha) {
        if (email == null || senha == null || email.isBlank() || senha.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }

        if (!EMAIL_VALIDO.equalsIgnoreCase(email.trim()) || !SENHA_VALIDA.equals(senha)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }

        String token = jwtUtil.generateToken(email.trim());
        UsuarioResponse usuarioResponse = new UsuarioResponse(1L, "Recepção", email.trim(), "RECEPCAO");
        return new LoginResponse(token, usuarioResponse);
    }
}
