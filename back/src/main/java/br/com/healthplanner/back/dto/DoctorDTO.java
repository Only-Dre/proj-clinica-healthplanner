package br.com.healthplanner.back.dto;

public class DoctorDTO {
    private Long id;
    private String name;
    private String phone;
    private String cpf;
    private String specialty;


    public DoctorDTO(){}

    // Getters e Setters
    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getPhone() {
        return phone;
    }


    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getCpf() {
        return cpf;
    }


    public void setCpf(String cpf) {
        this.cpf = cpf;
    }


    public String getSpecialty() {
        return specialty;
    }


    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    
    
}
