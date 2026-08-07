package br.com.healthplanner.back.controller;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.healthplanner.back.dto.DoctorDTO;


@RestController
@RequestMapping
public class DoctorController {

    public ArrayList<DoctorDTO> doctors = new ArrayList<>();
    public Long nextId = 1L;

    @RequestMapping("/doctors")
    public ArrayList<DoctorDTO> showDoctors() {
        return doctors;
    }

    @RequestMapping("/insertDoctor")
    public DoctorDTO insertDoctor(@RequestBody DoctorDTO doctor) {
        DoctorDTO newDoctor = new DoctorDTO();
        newDoctor.setId(nextId++);
        newDoctor.setName(doctor.getName());
        newDoctor.setCpf(doctor.getCpf());
        newDoctor.setPhone(doctor.getPhone());
        newDoctor.setSpecialty(doctor.getSpecialty());
        doctors.add(newDoctor);
        return newDoctor;
    }
    
}
