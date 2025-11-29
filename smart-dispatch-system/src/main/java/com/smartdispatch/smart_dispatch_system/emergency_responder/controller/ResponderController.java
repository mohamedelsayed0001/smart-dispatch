package com.smartdispatch.smart_dispatch_system.emergency_responder.controller;

import com.smartdispatch.smart_dispatch_system.emergency_responder.dto.*;
import com.smartdispatch.smart_dispatch_system.emergency_responder.service.ResponderService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ResponderController {

    @Autowired
    private final ResponderService responderService;

    @GetMapping("/profile/{responderId}")
    public ResponseEntity<ResponderProfileDTO> getProfile(@PathVariable Integer responderId) {
        ResponderProfileDTO profile = responderService.getResponderProfile(responderId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get all active assignments for the responder
     */
    @GetMapping("/assignments/active/{responderId}")
    public ResponseEntity<List<AssignmentDTO>> getActiveAssignments(@PathVariable Integer responderId) {
        List<AssignmentDTO> assignments = responderService.getActiveAssignments(responderId);
        return ResponseEntity.ok(assignments);
    }

    /**
     * Get specific assignment details
     */
    @GetMapping("/assignments/{assignmentId}/responder/{responderId}")
    public ResponseEntity<AssignmentDTO> getAssignmentDetails(
            @PathVariable Integer assignmentId,
            @PathVariable Integer responderId) {
        AssignmentDTO assignment = responderService.getAssignmentDetails(assignmentId, responderId);
        return ResponseEntity.ok(assignment);
    }

    /**
     * Get vehicle and incident locations for an assignment
     */
    @GetMapping("/assignments/{assignmentId}/locations/{responderId}")
    public ResponseEntity<LocationsResponseDTO> getAssignmentLocations(
            @PathVariable Integer assignmentId,
            @PathVariable Integer responderId) {
        LocationsResponseDTO locations = responderService.getAssignmentLocations(assignmentId, responderId);
        return ResponseEntity.ok(locations);
    }

    /**
     * Update vehicle location
     */
    @PostMapping("/location/{responderId}")
    public ResponseEntity<Void> updateLocation(
            @PathVariable Integer responderId,
            @RequestBody LocationDTO locationDTO) {
        responderService.updateVehicleLocation(responderId, locationDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * Update assignment and vehicle status
     */
    @PutMapping("/assignments/{assignmentId}/status/{responderId}")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Integer assignmentId,
            @PathVariable Integer responderId,
            @RequestBody StatusUpdateDTO statusDTO) {
        responderService.updateStatus(assignmentId, responderId, statusDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * Get assignment history with pagination
     */
    @GetMapping("/assignments/history/{responderId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentHistory(
            @PathVariable Integer responderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<AssignmentDTO> history = responderService.getAssignmentHistory(responderId, page, size);
        return ResponseEntity.ok(history);
    }

    /**
     * Accept an assignment (update status to active)
     */
    @PostMapping("/assignments/{assignmentId}/accept/{responderId}")
    public ResponseEntity<Void> acceptAssignment(
            @PathVariable Integer assignmentId,
            @PathVariable Integer responderId) {
        
        StatusUpdateDTO statusDTO = new StatusUpdateDTO();
        statusDTO.setVehicleStatus("On Route");
        statusDTO.setAssignmentStatus("active");
        
        responderService.updateStatus(assignmentId, responderId, statusDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark arrival at incident location
     */
    @PostMapping("/assignments/{assignmentId}/arrive/{responderId}")
    public ResponseEntity<Void> markArrival(
            @PathVariable Integer assignmentId,
            @PathVariable Integer responderId) {
        
        StatusUpdateDTO statusDTO = new StatusUpdateDTO();
        statusDTO.setVehicleStatus("Resolving");
        
        responderService.updateStatus(assignmentId, responderId, statusDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * Complete an assignment
     */
    @PostMapping("/assignments/{assignmentId}/complete/{responderId}")
    public ResponseEntity<Void> completeAssignment(
            @PathVariable Integer assignmentId,
            @PathVariable Integer responderId) {
        
        StatusUpdateDTO statusDTO = new StatusUpdateDTO();
        statusDTO.setAssignmentStatus("completed");
        
        responderService.updateStatus(assignmentId, responderId, statusDTO);
        return ResponseEntity.ok().build();
    }
}