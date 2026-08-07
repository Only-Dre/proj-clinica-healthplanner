package br.com.healthplanner.back.controller;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.healthplanner.back.dto.DoctorDTO;


@RestController
@RequestMapping("/apiD")
public class DoctorController {

    public ArrayList<DoctorDTO> doctors = new ArrayList<>();

    @RequestMapping("/doctors")
    public ArrayList<DoctorDTO> showDoctors() {
        return doctors;
    }

    @RequestMapping
    public DoctorDTO insertDoctor(@RequestBody DoctorDTO doctor) {
        doctors.add(doctor);
        return doctor;
    }
    
}
