package br.com.healthplanner.back.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.healthplanner.back.model.Doctor;
import br.com.healthplanner.back.repository.DoctorRepository;

@Service
public class DoctorService {
    
    @Autowired
    private DoctorRepository DoctorRepository;

    @Autowired PasswordEncoder passwordEncoder;

    public Doctor salvar(Doctor doctor){
        doctor.setSenha(
            passwordEncoder.encode(doctor.getSenha())
        );
        return DoctorRepository.save(doctor);
    }
    
}
