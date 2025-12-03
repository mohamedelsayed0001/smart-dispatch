package com.smartdispatch.emergency_responder.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartdispatch.emergency_responder.dto.*;
import com.smartdispatch.emergency_responder.service.ResponderService;
import com.smartdispatch.security.model.AppUserDetails;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responder")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class ResponderController {

    @Autowired
    private final ResponderService responderService;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal AppUserDetails userDetails) {

        Integer responderId = userDetails.getId().intValue();
        Map<String, Object> profile = responderService.getResponderProfile(responderId);

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/assignments/{assignmentId}")
    public ResponseEntity<AssignmentDTO> getAssignmentDetails(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId) {

        Integer responderId = userDetails.getId().intValue();
        AssignmentDTO assignment = responderService.getAssignmentDetails(assignmentId, responderId);

        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/assignments/{assignmentId}/locations")
    public ResponseEntity<LocationsResponseDTO> getAssignmentLocations(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId) {

        Integer responderId = userDetails.getId().intValue();
        LocationsResponseDTO locations = responderService.getAssignmentLocations(assignmentId, responderId);

        return ResponseEntity.ok(locations);
    }

    @PostMapping("/location")
    public ResponseEntity<Void> updateLocation(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @RequestBody LocationDTO locationDTO) {

        Integer responderId = userDetails.getId().intValue();
        responderService.updateVehicleLocation(responderId, locationDTO);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/assignments/{assignmentId}/status")
    public ResponseEntity<Void> updateStatus(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId,
            @RequestBody StatusUpdateDTO statusDTO) {

        Integer responderId = userDetails.getId().intValue();
        responderService.updateStatus(assignmentId, responderId, statusDTO);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/assignments/{assignmentId}/arrive")
    public ResponseEntity<Void> markArrival(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId) {

        Integer responderId = userDetails.getId().intValue();

        StatusUpdateDTO statusDTO = new StatusUpdateDTO();
        statusDTO.setVehicleStatus("Resolving");

        responderService.updateStatus(assignmentId, responderId, statusDTO);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/assignments/{assignmentId}/complete")
    public ResponseEntity<Void> completeAssignment(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId) {

        Integer responderId = userDetails.getId().intValue();

        StatusUpdateDTO statusDTO = new StatusUpdateDTO();
        statusDTO.setAssignmentStatus("completed");

        responderService.updateStatus(assignmentId, responderId, statusDTO);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentDTO>> getAllAssignments(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Integer responderId = userDetails.getId().intValue();
        List<AssignmentDTO> assignments = responderService.getAllAssignments(responderId, page, size);

        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/assignments/{assignmentId}/respond")
    public ResponseEntity<AssignmentActionResponseDTO> respondToAssignment(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId,
            @RequestBody AssignmentResponseDTO responseDTO) {

        Integer responderId = userDetails.getId().intValue();

        AssignmentActionResponseDTO response =
                responderService.respondToAssignment(assignmentId, responderId, responseDTO.getResponse());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/assignments/{assignmentId}/cancel")
    public ResponseEntity<AssignmentActionResponseDTO> cancelAssignment(
            @AuthenticationPrincipal AppUserDetails userDetails,
            @PathVariable Integer assignmentId) {

        Integer responderId = userDetails.getId().intValue();

        AssignmentActionResponseDTO result =
                responderService.cancelAssignment(assignmentId, responderId);

        return ResponseEntity.ok(result);
    }
}
