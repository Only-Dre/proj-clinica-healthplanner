package br.com.healthplanner.back.dto;

public class DoctorDTO {
    private Long id;
    private String name;
    private String phone;
    private String
    private String specialty;


    public DoctorDTO(){}

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
    
}
