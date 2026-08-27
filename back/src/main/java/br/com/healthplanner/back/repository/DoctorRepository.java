package br.com.healthplanner.back.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.healthplanner.back.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long>{
}
