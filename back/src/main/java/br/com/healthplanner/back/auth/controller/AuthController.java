package br.com.healthplanner.back.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import br.com.healthplanner.back.auth.dto.LoginRequest;
import br.com.healthplanner.back.auth.dto.LoginResponse;
import br.com.healthplanner.back.auth.service.AuthService;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.autenticar(request.getEmail(), request.getSenha()));
    }
}
