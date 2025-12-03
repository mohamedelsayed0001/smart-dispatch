package com.smartdispatch.vehiclemanagement.controller;

import com.smartdispatch.vehiclemanagement.Dto.VehicleDto;
import com.smartdispatch.vehiclemanagement.service.VehicleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.management.ServiceNotFoundException;
import java.util.List;
//eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJpZCI6IjE3IiwiZW1haWwiOiJib21iQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiZmZmIiwic3ViIjoiMTciLCJpYXQiOjE3NjQ1Mzg0MjAsImV4cCI6MTc2NDYyNDgyMH0.EJBoAUTo3SqLFKanRD2ha0_Cp9Q49IJ0UlvSGZKKirQ
@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping("/create")
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> createService( @RequestBody VehicleDto vehicleDto) throws Exception {
        try {
            if (vehicleDto.getId() != null && vehicleDto.getId() != 0) {
                return ResponseEntity.badRequest().body("ID should not be provided when creating a service");
            }

            vehicleService.createService(vehicleDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Vehicle created successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create vehicle: " + e.getMessage());
        }
    }

    @PostMapping("/edit/{id}")
//    @PreAuthorize("hasRole('ROLE_ADMIN')"
    public ResponseEntity<String> editService(@PathVariable long id,  @RequestBody VehicleDto vehicleDto) throws Exception {
        try {
            if (id <= 0) {
                throw new ServiceNotFoundException("Service with ID " + id + " not found");
            }
            vehicleService.editService(id, vehicleDto);
            return ResponseEntity.ok("Service edited successfully!");
        } catch (ServiceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to edit vehicle: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    /*@PreAuthorize("hasRole('ROLE_ADMIN')")*/
    public ResponseEntity<String> deleteService(@PathVariable long id) throws Exception {
        try {
            if (id <= 0) {
                return ResponseEntity.badRequest().body("Invalid ID");
            }

            vehicleService.deleteService(id);
            return ResponseEntity.ok("Service deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete vehicle: " + e.getMessage());
        }

    }

    @GetMapping("/getAllVehicles")
    public ResponseEntity<List<VehicleDto>> getAllService() throws Exception {
        try {
            List<VehicleDto> serviceDtoList = vehicleService.getAllService();
            if (serviceDtoList != null && !serviceDtoList.isEmpty()) {
                return ResponseEntity.ok(serviceDtoList);
            } else {
                return ResponseEntity.ok(List.of());
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getVehicleDetails/{Id}")
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<VehicleDto> getDetails(@PathVariable long Id) throws Exception{
        try {
            if (Id <= 0) {
                return ResponseEntity.badRequest().build();
            }

            VehicleDto details = vehicleService.getDetails(Id);
            if (details != null) {
                return ResponseEntity.ok(details);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}