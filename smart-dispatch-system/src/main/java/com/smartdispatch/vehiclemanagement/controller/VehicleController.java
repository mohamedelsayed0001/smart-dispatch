package com.smartdispatch.vehiclemanagement.controller;

import com.smartdispatch.vehiclemanagement.Dto.VehicleDto;
import com.smartdispatch.vehiclemanagement.service.VehicleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.management.ServiceNotFoundException;
import java.util.List;

@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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

    // TODO remove vehicle location from redis
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VehicleDto>> getAllService() throws Exception {
        try {
            List<VehicleDto> serviceDtoList = vehicleService.getAllService();
            if (serviceDtoList != null && !serviceDtoList.isEmpty()) {
                return ResponseEntity.ok(serviceDtoList);
            } else {
                return ResponseEntity.ok(List.of());
            }
        } catch (Exception e) {
            logger.error("Error getting all vehicles: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @GetMapping("/getVehicleDetails/{Id}")
    // @PreAuthorize("hasRole('ADMIN')")
    // public ResponseEntity<VehicleDto> getDetails(@PathVariable long Id) throws Exception{
    //     try {
    //         if (Id <= 0) {
    //             return ResponseEntity.badRequest().build();
    //         }

    //         VehicleDto details = vehicleService.getDetails(Id);
    //         if (details != null) {
    //             return ResponseEntity.ok(details);
    //         } else {
    //             return ResponseEntity.notFound().build();
    //         }
    //     } catch (Exception e) {
    //         System.out.println(e.getMessage());
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    //     }
    // }
}