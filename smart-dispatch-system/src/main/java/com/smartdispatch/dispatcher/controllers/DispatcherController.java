package com.smartdispatch.dispatcher.controllers;

import com.smartdispatch.dispatcher.domains.dtos.AssignmentDto;
import com.smartdispatch.dispatcher.domains.dtos.AssignmentRequest;
import com.smartdispatch.dispatcher.domains.dtos.IncidentDto;
import com.smartdispatch.dispatcher.domains.dtos.VehicleDto;
import com.smartdispatch.dispatcher.services.DispatcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatcher")
@CrossOrigin(origins = "*")
public class DispatcherController {
    @Autowired
    private DispatcherService dispatcherService;
    @GetMapping("/incidents/pending")
    public ResponseEntity<List<IncidentDto>> getPendingIncidents() {
        List<IncidentDto> incidents = dispatcherService.getPendingIncidents();
        return ResponseEntity.ok(incidents);
    }
    @GetMapping("/vehicles/available")
    public ResponseEntity<List<VehicleDto>> getAvailableVehicles() {
        List<VehicleDto> vehicles = dispatcherService.getAvailableVehicles();
        return ResponseEntity.ok(vehicles);
    }
    @PostMapping("/assignments/create")
    public ResponseEntity<?> createAssignment(@RequestBody AssignmentRequest request) {
        try {
            AssignmentDto assignmentDto = dispatcherService.assignVehicleToIncident(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(assignmentDto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }
}
