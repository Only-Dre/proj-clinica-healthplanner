package br.com.healthplanner.back.controller;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.healthplanner.back.dto.PatientDTO;

@RestController
@RequestMapping
public class PatientController {

    public ArrayList<PatientDTO> patients = new ArrayList<>();

    @RequestMapping("/patients")
    public ArrayList<PatientDTO> showPatients() {
        return patients;
    }
    
    @RequestMapping("/insertPatient")
    public PatientDTO insertPatient(@RequestBody PatientDTO patient) {
        patients.add(patient);
        return patient;
    }
    
    
}
